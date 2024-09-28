import type { BillingPlan } from "core/db"
import { getPlanData } from "core/plans"
import _isMatch from "lodash/isMatch"
import _omit from "lodash/omit"
import _pick from "lodash/pick"
import type Stripe from "stripe"
import { db } from "../lib/db"
import { stripe as api, STRIPE_FREE_PRICE_CONFIG_KEY, STRIPE_METADATA_KEYS, STRIPE_PORTAL_CONFIG_KEY } from "../lib/stripe"
import { useEnvVar } from "../lib/utils"


const NON_UPDATABLE_PRICE_PROPERTIES = ["unit_amount", "product", "currency", "recurring"]


/* THE ACTION ------------------------------------------- */

switch (process.argv[2]) {
    case "sync":
        await syncProductsToStripe()
        break
    case "purge":
        await purgeConfigs()
        await purgeProducts("free")
        await purgeProducts("basic")
        await purgeProducts("pro")
        await purgeWebhooks()
        break
    case "list-billing-configs":
        await api.billingPortal.configurations.list({
            active: true,
            limit: 100,
        }).then(r => r.data.filter(config =>
            config.metadata?.[STRIPE_METADATA_KEYS.WFD] === "true"
            && config.metadata?.[STRIPE_METADATA_KEYS.ENVIRONMENT] === useEnvVar("ENVIRONMENT")
        ))
            // .then(console.log) // more verbose option for debugging
            .then(configs => console.log(configs.map(c => c.id).join("\n")))
        break
    default:
        console.log("Usage: sync-stripe.ts [sync|purge]")
        process.exit(1)
}

/* - ---------------------------------------------------- */


export async function syncProductsToStripe({
    dryRun = false,
}: SyncOptions = {}) {
    console.log("Syncing products to Stripe...", dryRun ? "(dry run)" : "")

    const { monthlyPrice: freePrice } = await upsertPlan("free", { dryRun })
    await upsertPlan("basic", { dryRun })
    await upsertPlan("pro", { dryRun })

    const portalConfig = await upsertBillingPortalConfig(["free", "basic", "pro"], { dryRun })

    if (!useEnvVar("APP_ORIGIN").includes("localhost"))
        await upsertWebhook({ dryRun })

    if (!dryRun) {
        // update app config
        await db.insertInto("general_config")
            .values([
                { key: STRIPE_PORTAL_CONFIG_KEY, value: portalConfig?.id ?? null },
                { key: STRIPE_FREE_PRICE_CONFIG_KEY, value: freePrice?.id ?? null },
            ])
            .onConflict(
                oc => oc.column("key")
                    .doUpdateSet(eb => ({ value: eb.ref("excluded.value") }))
            )
            .execute()
    }

    await db.destroy()
    console.log("Finished sync.", dryRun ? "(dry run)" : "")
}


/**
 * Creates or updates a plan for a given plan key. Consists
 * of creating or updating the product and whatever associated
 * prices are needed.
 */
async function upsertPlan(planKey: BillingPlan, {
    dryRun = false,
}: SyncOptions = {}) {
    const planData = getPlanData(planKey)
    if (!planData.syncToStripe)
        throw new Error(`Plan ${planKey} is not meant to be synced to Stripe`)

    const product = await upsertProduct(planKey, { dryRun })
    let monthlyPrice: Stripe.Price | null = null
    let yearlyPrice: Stripe.Price | null = null

    if (product) {
        monthlyPrice = await upsertPrice(planKey, {
            frequency: "monthly",
            productId: product.id,
            dryRun,
        })
        if (planData.yearlyPrice)
            yearlyPrice = await upsertPrice(planKey, {
                frequency: "yearly",
                productId: product.id,
                dryRun,
            })
    }

    return { product, monthlyPrice, yearlyPrice }
}


/**
 * Searches for a product by plan key. Checks that this product has
 * metadata saying it's for WorkflowDog, for the current environment,
 * and for the given plan key.
 */
async function findProduct(planKey: BillingPlan): Promise<Stripe.Product | undefined> {
    return api.products.search({
        query: [
            `metadata["${STRIPE_METADATA_KEYS.WFD}"]:"true"`,
            `metadata["${STRIPE_METADATA_KEYS.ENVIRONMENT}"]:"${useEnvVar("ENVIRONMENT")}"`,
            `metadata["${STRIPE_METADATA_KEYS.PLAN_KEY}"]:"${planKey}"`,
            `active:"true"`,
        ].join(" AND "),
    }).then(r => r.data[0])
}


/**
 * Creates or updates a product for a given plan key.
 */
async function upsertProduct(planKey: BillingPlan, {
    dryRun = false,
}: SyncOptions = {}) {

    const planData = getPlanData(planKey)
    if (!planData.syncToStripe)
        throw new Error(`Plan ${planKey} is not meant to be synced to Stripe`)

    const stripeProductData: Stripe.ProductCreateParams = {
        statement_descriptor: "WFD " + planKey.toUpperCase(),
        images: ["https://workflow.dog/__marketing/images/logo-square-white-padded.png"],
        name: "WorkflowDog " + planData.name,
        description: planData.description,
        marketing_features: planData.features.map(f => ({ name: f })),
        metadata: {
            [STRIPE_METADATA_KEYS.WFD]: "true",
            [STRIPE_METADATA_KEYS.ENVIRONMENT]: useEnvVar("ENVIRONMENT"),
            [STRIPE_METADATA_KEYS.PLAN_KEY]: planKey,
        },
    }

    const existingProduct = await findProduct(planKey)
    if (!existingProduct) {
        console.log(`Creating product ${planKey}`)
        return dryRun ? null : api.products.create(stripeProductData)
    }

    const shouldUpdate = !_isMatch(existingProduct, stripeProductData)
    if (shouldUpdate) {
        console.log(`Updating product ${planKey}`)
        return dryRun ? null : api.products.update(existingProduct.id, stripeProductData)
    }

    console.log(`Nothing to update for product ${planKey}`)
    return existingProduct
}


/**
 * Searches for a product by plan key. Checks that this product has
 * metadata saying it's for WorkflowDog, for the current environment,
 * for the given plan key, and for the given frequency.
 */
async function findPrice(planKey: BillingPlan, frequency: "monthly" | "yearly"): Promise<Stripe.Price | undefined> {
    return api.prices.search({
        query: [
            `metadata["${STRIPE_METADATA_KEYS.WFD}"]:"true"`,
            `metadata["${STRIPE_METADATA_KEYS.ENVIRONMENT}"]:"${useEnvVar("ENVIRONMENT")}"`,
            `metadata["${STRIPE_METADATA_KEYS.PLAN_KEY}"]:"${planKey}"`,
            `metadata["${STRIPE_METADATA_KEYS.FREQUENCY}"]:"${frequency}"`,
            `active:"true"`,
        ].join(" AND "),
    }).then(r => r.data[0])
}


/**
 * Creates or updates a price for a given plan key and frequency.
 * Certain properties of prices cannot be updated, so this function
 * will archive the price and create a new one with the updated
 * properties.
 * 
 * Oh yeah, you can't delete prices from the API either...
 */
async function upsertPrice(planKey: BillingPlan, {
    frequency,
    productId,
    skipSearch = false,
    dryRun = false,
}: {
    frequency: "monthly" | "yearly",
    productId: string,
    skipSearch?: boolean,
} & SyncOptions): Promise<Stripe.Price | null> {

    const planData = getPlanData(planKey)
    if (!planData.syncToStripe)
        throw new Error(`Plan ${planKey} is not meant to be synced to Stripe`)

    const stripePriceData: Stripe.PriceCreateParams = {
        currency: "usd",
        unit_amount: frequency === "monthly"
            ? planData.monthlyPrice
            : planData.yearlyPrice!,
        recurring: {
            interval: frequency === "monthly" ? "month" : "year",
        },
        product: productId,
        metadata: {
            [STRIPE_METADATA_KEYS.WFD]: "true",
            [STRIPE_METADATA_KEYS.ENVIRONMENT]: useEnvVar("ENVIRONMENT"),
            [STRIPE_METADATA_KEYS.PLAN_KEY]: planKey,
            [STRIPE_METADATA_KEYS.FREQUENCY]: frequency,
        },
    }

    const existingPrice = skipSearch ? null : await findPrice(planKey, frequency)

    if (!existingPrice) {
        console.log(`Creating price ${planKey} / ${frequency}`)
        if (dryRun)
            return null

        const newPrice = await api.prices.create(stripePriceData)
        if (frequency === "monthly")
            await api.products.update(productId, { default_price: newPrice.id })

        return newPrice
    }

    const nonUpdatablePriceData = _pick(stripePriceData, NON_UPDATABLE_PRICE_PROPERTIES)
    const canUpdate = _isMatch(existingPrice, nonUpdatablePriceData)

    if (!canUpdate) {
        console.log(`Price ${planKey} / ${frequency} changed non-updatable properties, deleting and recreating`)
        if (dryRun)
            return null

        const newPrice = await upsertPrice(planKey, {
            frequency, productId, dryRun,
            skipSearch: true,
        })
        await api.prices.update(existingPrice.id, { active: false })

        return newPrice
    }

    const updatablePriceData = _omit(stripePriceData, NON_UPDATABLE_PRICE_PROPERTIES)
    const shouldUpdate = !_isMatch(existingPrice, updatablePriceData)

    if (shouldUpdate) {
        console.log(`Updating price ${planKey} / ${frequency}`)
        return dryRun ? null : api.prices.update(existingPrice.id, updatablePriceData)
    }

    console.log(`Nothing to update for price ${planKey} / ${frequency}`)
    return existingPrice
}


/**
 * Creates or updates the billing portal configuration for the given
 * plan keys.
 * 
 * Unfortantely, the list endpoint doesn't return the products, which is 
 * the most likely thing to change. So this will end up triggering an
 * update even if things haven't changed. However, it's not a big deal.
 */
async function upsertBillingPortalConfig(planKeys: BillingPlan[], {
    dryRun = false,
}: SyncOptions = {}) {
    const products = await Promise.all(planKeys.map(async planKey => {
        const planData = getPlanData(planKey)
        if (!planData.syncToStripe)
            throw new Error(`Plan ${planKey} is not meant to be synced to Stripe`)

        const [product, monthlyPrice, yearlyPrice] = await Promise.all([
            findProduct(planKey),
            findPrice(planKey, "monthly"),
            planData.yearlyPrice ? findPrice(planKey, "yearly") : undefined,
        ])

        if (!product || !monthlyPrice)
            return undefined

        return {
            product: product.id,
            prices: [monthlyPrice.id, yearlyPrice?.id].filter(Boolean) as string[],
        }
    })).then(r => r.filter(x => !!x))

    const stripeBillingPortalConfig: Stripe.BillingPortal.ConfigurationCreateParams = {
        business_profile: {
            headline: "WorkflowDog",
            privacy_policy_url: "https://workflow.dog/privacy",
            terms_of_service_url: "https://workflow.dog/terms",
        },
        features: {
            customer_update: {
                enabled: true,
                allowed_updates: ["name", "email", "phone"],
            },
            invoice_history: {
                enabled: true,
            },
            payment_method_update: {
                enabled: true,
            },
            subscription_update: {
                enabled: true,
                default_allowed_updates: ["price", "promotion_code"],
                products,
            },
            // I'm not a scumbag, I'm just using a price of 0 for the free plan
            // so that every project always has a subscription
            subscription_cancel: {
                enabled: false,
            },
        },
        login_page: {
            enabled: false,
        },
        metadata: {
            [STRIPE_METADATA_KEYS.WFD]: "true",
            [STRIPE_METADATA_KEYS.ENVIRONMENT]: useEnvVar("ENVIRONMENT"),
        },
    }

    const existingConfig = await api.billingPortal.configurations.list({
        active: true,
        limit: 100,
    }).then(r => r.data.find(config =>
        config.metadata?.[STRIPE_METADATA_KEYS.WFD] === "true"
        && config.metadata?.[STRIPE_METADATA_KEYS.ENVIRONMENT] === useEnvVar("ENVIRONMENT")
    ))

    if (!existingConfig) {
        console.log(`Creating billing portal config`)
        return dryRun ? null : api.billingPortal.configurations.create(stripeBillingPortalConfig)
    }

    const shouldUpdate = !_isMatch(existingConfig, stripeBillingPortalConfig)

    if (shouldUpdate) {
        console.log(`Updating billing portal config`)
        return dryRun
            ? null
            : api.billingPortal.configurations.update(existingConfig.id, stripeBillingPortalConfig)
    }

    console.log(`Nothing to update for billing portal config`)
    return existingConfig
}


/**
 * Creates or updates a webhook endpoint for Stripe to send events to.
 */
async function upsertWebhook({
    dryRun = false,
}: SyncOptions = {}) {

    const stripeWebhookData: Stripe.WebhookEndpointCreateParams = {
        enabled_events: ["customer.subscription.updated"],
        url: `${useEnvVar("APP_ORIGIN")}/api/stripe/webhook`,
        metadata: {
            [STRIPE_METADATA_KEYS.WFD]: "true",
            [STRIPE_METADATA_KEYS.ENVIRONMENT]: useEnvVar("ENVIRONMENT"),
        },
    }

    const existingWebhook = await api.webhookEndpoints.list({
        limit: 100,
    }).then(r => r.data.find(wh =>
        wh.metadata?.[STRIPE_METADATA_KEYS.WFD] === "true"
        && wh.metadata?.[STRIPE_METADATA_KEYS.ENVIRONMENT] === useEnvVar("ENVIRONMENT")
    ))

    if (!existingWebhook) {
        console.log("Creating webhook endpoint")
        return dryRun ? null : api.webhookEndpoints.create(stripeWebhookData)
    }

    const shouldUpdate = !_isMatch(existingWebhook, stripeWebhookData)
    if (shouldUpdate) {
        console.log("Updating webhook endpoint")
        return dryRun ? null : api.webhookEndpoints.update(existingWebhook.id, stripeWebhookData)
    }

    console.log("Nothing to update for webhook endpoint")
    return existingWebhook
}


async function purgeProducts(planKey: BillingPlan) {

    const prices = await api.prices.search({
        query: [
            `metadata["${STRIPE_METADATA_KEYS.WFD}"]:"true"`,
            `metadata["${STRIPE_METADATA_KEYS.ENVIRONMENT}"]:"${useEnvVar("ENVIRONMENT")}"`,
            `metadata["${STRIPE_METADATA_KEYS.PLAN_KEY}"]:"${planKey}"`,
            `active:"true"`,
        ].join(" AND "),
    }).then(r => r.data)

    for (const p of prices) {
        try {
            await api.prices.update(p.id, { active: false })
            console.log(`Deactivated price ${p.id}`)
        } catch (err: any) {
            console.log(`Failed to deactivate price ${p.id}:`, err.message)
        }
    }

    const products = await api.products.search({
        query: [
            `metadata["${STRIPE_METADATA_KEYS.WFD}"]:"true"`,
            `metadata["${STRIPE_METADATA_KEYS.ENVIRONMENT}"]:"${useEnvVar("ENVIRONMENT")}"`,
            `metadata["${STRIPE_METADATA_KEYS.PLAN_KEY}"]:"${planKey}"`,
            `active:"true"`,
        ].join(" AND "),
    }).then(r => r.data)

    for (const p of products) {
        try {
            await api.products.del(p.id)
            console.log(`Deleted product ${p.id}`)
        } catch (err: any) {
            console.log(`Failed to delete product ${p.id}:`, err.message)
            console.log("Gonna try deactivating")

            try {
                await api.products.update(p.id, { active: false })
                console.log(`Deactivated product ${p.id}`)
            } catch (err: any) {
                console.log(`Failed to deactivate product ${p.id}:`, err.message)
            }
        }
    }
}


async function purgeConfigs() {
    const configs = await api.billingPortal.configurations.list({
        active: true,
        limit: 100,
    }).then(r => r.data.filter(c =>
        c.metadata?.[STRIPE_METADATA_KEYS.WFD] === "true"
        && c.metadata?.[STRIPE_METADATA_KEYS.ENVIRONMENT] === useEnvVar("ENVIRONMENT")
    ))

    for (const c of configs) {
        try {
            await api.billingPortal.configurations.update(c.id, { active: false })
            console.log(`Deactivated billing portal config ${c.id}`)
        } catch (err: any) {
            console.log(`Failed to deactivate billing portal config ${c.id}:`, err.message)
        }
    }
}


async function purgeWebhooks() {
    const webhooks = await api.webhookEndpoints.list({
        limit: 100,
    }).then(r => r.data.filter(wh =>
        wh.metadata?.[STRIPE_METADATA_KEYS.WFD] === "true"
        && wh.metadata?.[STRIPE_METADATA_KEYS.ENVIRONMENT] === useEnvVar("ENVIRONMENT")
    ))

    for (const wh of webhooks) {
        try {
            await api.webhookEndpoints.del(wh.id)
            console.log(`Deleted webhook endpoint ${wh.id}`)
        } catch (err: any) {
            console.log(`Failed to delete webhook endpoint ${wh.id}:`, err.message)
        }
    }
}


interface SyncOptions {
    dryRun?: boolean
}