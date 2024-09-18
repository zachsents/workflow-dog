import type { BillingPlan } from "core/db"
import { getPlanData } from "core/plans"
import { getObjectPaths } from "core/utils"
import _isEqual from "lodash/isEqual"
import _omit from "lodash/omit"
import _pick from "lodash/pick"
import _get from "lodash/get"
import type Stripe from "stripe"
import { stripe as api } from "../lib/stripe"
import { db } from "../lib/db"


const WFD_KEY = "wfd"
const PLAN_KEY_KEY = "wfd_plan_key"
const NON_UPDATABLE_PRICE_PROPERTIES = ["unit_amount", "product", "currency", "recurring"]

const createBillingPortalConfig = (products: { product: string, prices: string[] }[]): Stripe.BillingPortal.ConfigurationCreateParams => ({
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
        [WFD_KEY]: "true",
    },
})


await syncProductsToStripe()


export async function syncProductsToStripe() {
    const [, freeMonthlyPrice] = await createOrUpdatePlan("free")
    const [, basicMonthlyPrice, basicYearlyPrice] = await createOrUpdatePlan("basic")
    const [, proMonthlyPrice, proYearlyPrice] = await createOrUpdatePlan("pro")
    const portalConfig = await createOrUpdateBillingPortalConfig(["free", "basic", "pro"])

    await db.insertInto("general_config")
        .values([
            { key: "stripe_free_price_id", value: freeMonthlyPrice?.id ?? null },
            { key: "stripe_basic_monthly_price_id", value: basicMonthlyPrice?.id ?? null },
            { key: "stripe_basic_yearly_price_id", value: basicYearlyPrice?.id ?? null },
            { key: "stripe_pro_monthly_price_id", value: proMonthlyPrice?.id ?? null },
            { key: "stripe_pro_yearly_price_id", value: proYearlyPrice?.id ?? null },
            { key: "stripe_billing_portal_config_id", value: portalConfig.id ?? null },
        ])
        .onConflict(oc => oc.column("key").doUpdateSet(eb => ({ value: eb.ref("excluded.value") })))
        .execute()

    await db.destroy()
    console.log("Synced products to Stripe")
}


async function createOrUpdatePlan(planKey: BillingPlan) {
    const planData = getPlanData(planKey)
    if (!planData.syncToStripe)
        return []

    const product = await createOrUpdateProduct(planKey)

    const monthlyPrice = await createOrUpdatePrice(planKey, "monthly", product)
    if (planData.yearlyPrice)
        var yearlyPrice = await createOrUpdatePrice(planKey, "yearly", product)

    return [product, monthlyPrice, yearlyPrice] as const
}


async function findProduct(planKey: BillingPlan) {
    return api.products.search({
        query: `metadata["${WFD_KEY}"]:"true" AND metadata["${PLAN_KEY_KEY}"]:"${planKey}" AND active:"true"`,
    }).then(r => r.data[0])
}


async function createOrUpdateProduct(planKey: BillingPlan) {
    const planData = getPlanData(planKey)

    const existingProduct = await findProduct(planKey)

    const stripeProductData: Stripe.ProductCreateParams = {
        statement_descriptor: "WFD " + planKey.toUpperCase(),
        images: ["https://workflow.dog/__marketing/images/logo-square-white-padded.png"],
        name: "WorkflowDog " + planData.name,
        description: planData.description,
        marketing_features: planData.features.map(f => ({ name: f })),
        metadata: {
            [WFD_KEY]: "true",
            [PLAN_KEY_KEY]: planKey,
        },
    }

    if (!existingProduct) {
        console.log(`Creating product ${planKey}`)
        return api.products.create(stripeProductData)
    }

    const shouldUpdate = !_isEqual(
        _pick(existingProduct, getObjectPaths(stripeProductData)),
        stripeProductData,
    )

    if (shouldUpdate) {
        console.log(`Updating product ${planKey}`)
        return api.products.update(existingProduct.id, stripeProductData)
    }

    console.log(`Nothing to update for product ${planKey}`)
    return existingProduct
}


async function findPrice(planKey: BillingPlan, frequency: "monthly" | "yearly") {
    return api.prices.search({
        query: [
            `metadata["${WFD_KEY}"]:"true"`,
            `metadata["${PLAN_KEY_KEY}"]:"${planKey}"`,
            `metadata["frequency"]:"${frequency}"`,
            `active:"true"`,
        ].join(" AND "),
    }).then(r => r.data[0])
}


async function createOrUpdatePrice(
    planKey: BillingPlan,
    frequency: "monthly" | "yearly",
    stripeProduct: Stripe.Product,
    skipSearch?: boolean,
): Promise<Stripe.Price | undefined> {
    const planData = getPlanData(planKey)
    if (!planData.syncToStripe)
        return

    const stripePriceData: Stripe.PriceCreateParams = {
        currency: "usd",
        unit_amount: frequency === "monthly" ? planData.monthlyPrice : planData.yearlyPrice!,
        recurring: {
            interval: frequency === "monthly" ? "month" : "year",
        },
        product: stripeProduct.id,
        metadata: {
            [WFD_KEY]: "true",
            [PLAN_KEY_KEY]: planKey,
            frequency,
        },
    }

    const existingPrice = skipSearch ? undefined : await findPrice(planKey, frequency)

    if (!existingPrice) {
        console.log(`Creating price ${planKey} / ${frequency}`)
        return api.prices.create(stripePriceData).then(async r => {
            if (frequency === "monthly") {
                await api.products.update(stripeProduct.id, { default_price: r.id })
            }
            return r
        })
    }

    const pickedPriceData = _pick(stripePriceData, NON_UPDATABLE_PRICE_PROPERTIES)
    const canUpdate = _isEqual(
        _pick(existingPrice, getObjectPaths(pickedPriceData)),
        pickedPriceData,
    )

    if (!canUpdate) {
        console.log(`Price ${planKey} / ${frequency} changed non-updatable properties, deleting and recreating`)
        const newPrice = await createOrUpdatePrice(planKey, frequency, stripeProduct, true)
        await api.prices.update(existingPrice.id, { active: false })
        return newPrice
    }

    const omittedPriceData = _omit(stripePriceData, NON_UPDATABLE_PRICE_PROPERTIES)
    const shouldUpdate = !_isEqual(
        _pick(existingPrice, getObjectPaths(omittedPriceData)),
        omittedPriceData,
    )

    if (shouldUpdate) {
        console.log(`Updating price ${planKey} / ${frequency}`)
        return api.prices.update(existingPrice.id, omittedPriceData)
    }

    console.log(`Nothing to update for price ${planKey} / ${frequency}`)
    return existingPrice
}


async function createOrUpdateBillingPortalConfig(planKeys: BillingPlan[]) {
    const products = await Promise.all(
        planKeys.filter(planKey => getPlanData(planKey).syncToStripe).map(async planKey => {
            const planData = getPlanData(planKey)
            const [product, monthlyPrice, yearlyPrice] = await Promise.all([
                findProduct(planKey),
                findPrice(planKey, "monthly"),
                (planData.syncToStripe && planData.yearlyPrice)
                    ? findPrice(planKey, "yearly")
                    : undefined,
            ])
            return {
                product: product.id,
                prices: [monthlyPrice.id, yearlyPrice?.id].filter(Boolean) as string[],
            }
        })
    )

    const stripeBillingPortalConfig = createBillingPortalConfig(products)

    const existingConfig = await api.billingPortal.configurations.list({
        active: true,
    }).then(r => r.data.find(config => config.metadata?.[WFD_KEY] === "true"))

    if (!existingConfig) {
        console.log(`Creating billing portal config`)
        return api.billingPortal.configurations.create(stripeBillingPortalConfig)
    }

    // Unfortantely, the list endpoint doesn't return the products, which is 
    // the most likely thing to change. So this will end up triggering every
    // time, but it's not a big deal.
    const shouldUpdate = !_isEqual(
        _pick(existingConfig, getObjectPaths(stripeBillingPortalConfig)),
        stripeBillingPortalConfig,
    )

    if (shouldUpdate) {
        console.log(`Updating billing portal config`)
        return api.billingPortal.configurations.update(existingConfig.id, stripeBillingPortalConfig)
    }

    console.log(`Nothing to update for billing portal config`)
    return existingConfig
}