import Stripe from "stripe"
import { useEnvVar } from "./utils"
import type { Request, Response } from "express"
import { db } from "./db"
import type { BillingPlan } from "core/db"
import _omit from "lodash/omit"
import _pick from "lodash/pick"
import _isEqual from "lodash/isEqual"


const api = new Stripe(useEnvVar("STRIPE_KEY"))
export { api as stripe }


export async function handleWebhookRequest(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"]
    if (!signature)
        return res.status(400).send("No signature header provided")

    try {
        var event = await api.webhooks.constructEventAsync(req.body, signature, useEnvVar("STRIPE_WEBHOOK_SIGNING_SECRET"))
    } catch (err) {
        if (err instanceof Error)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        throw err
    }

    switch (event.type) {
        case "customer.subscription.created":
            // shouldn't need anything here
            break
        case "customer.subscription.deleted":
            // shouldn't need anything here
            break
        case "customer.subscription.updated": {
            const projectId = event.data.object.metadata.projectId
            if (!projectId)
                break

            let plan: BillingPlan
            switch (event.data.object.items.data[0].price.id) {
                case useEnvVar("STRIPE_FREE_PRICE_ID"):
                    plan = "free"
                    break
                case useEnvVar("STRIPE_BASIC_MONTHLY_PRICE_ID"):
                case useEnvVar("STRIPE_BASIC_YEARLY_PRICE_ID"):
                    plan = "basic"
                    break
                case useEnvVar("STRIPE_PRO_MONTHLY_PRICE_ID"):
                case useEnvVar("STRIPE_PRO_YEARLY_PRICE_ID"):
                    plan = "pro"
                    break
                default:
                    plan = "custom"
            }

            console.log(plan)

            await db.updateTable("projects")
                .set({ billing_plan: plan })
                .where("id", "=", projectId)
                .execute()

            break
        }
        default:
            console.log(`Unhandled Stripe event type ${event.type}`)
            return res.status(500).send("Unhandled Stripe event type")
    }
    res.status(200).send("OK")
}


export async function migrate() {

    await createOrUpdateProduct("free", {
        name: "WorkflowDog Free",
        description: "Try out automating with WorkflowDog.",
        monthlyPrice: { unit_amount: 0 },
        marketing_features: [
            { name: "100 workflow runs per month" },
            { name: "No additional team members" },
        ],
    })

    await createOrUpdateProduct("basic", {
        name: "WorkflowDog Basic",
        description: "Tackle basic automations for small teams.",
        monthlyPrice: { unit_amount: 2700 },
        yearlyPrice: { unit_amount: 26700 },
        marketing_features: [
            { name: "1,000 workflow runs per month" },
            { name: "Up to 3 team members" },
        ],
    })

    await createOrUpdateProduct("pro", {
        name: "WorkflowDog Business",
        description: "For larger teams automating tons of workflows.",
        monthlyPrice: { unit_amount: 9700 },
        yearlyPrice: { unit_amount: 92700 },
        marketing_features: [
            { name: "10,000 workflow runs per month" },
            { name: "Up to 20 team members" },
        ],
    })
}


async function createOrUpdateProduct(
    productKey: BillingPlan,
    { monthlyPrice, yearlyPrice, ...productData }: Stripe.ProductCreateParams & {
        monthlyPrice: Omit<Stripe.PriceCreateParams, "currency" | "product" | "recurring">
        yearlyPrice?: Omit<Stripe.PriceCreateParams, "currency" | "product" | "recurring">
    },
) {
    const product = await api.products.search({
        query: `metadata["product_key"]:"${productKey}" AND active:"true"`,
    }).then(r => {
        const fullProductData: Stripe.ProductCreateParams = {
            statement_descriptor: "WFD " + productKey.toUpperCase(),
            images: ["https://workflow.dog/__marketing/images/logo-square-white-padded.png"],
            ...productData,
            metadata: {
                wfd: "true",
                product_key: productKey,
                ...productData.metadata,
            },
        }

        if (r.data.length === 0) {
            console.log(`Creating product ${productKey}`)
            return api.products.create(fullProductData)
        }

        const shouldBeUpdated = !_isEqual(
            _pick(r.data[0], Object.keys(fullProductData)),
            fullProductData,
        )

        if (shouldBeUpdated) {
            console.log(`Updating product ${productKey}`)
            return api.products.update(r.data[0].id, fullProductData)
        }

        console.log(`Nothing to update for product ${productKey}`)
        return r.data[0]
    })

    await createOrUpdatePrice(`${productKey}/monthly`, {
        ...monthlyPrice,
        currency: "usd",
        recurring: {
            interval: "month",
        },
        product: product.id,
    }, true)

    if (yearlyPrice)
        await createOrUpdatePrice(`${productKey}/yearly`, {
            ...yearlyPrice,
            currency: "usd",
            recurring: {
                interval: "year",
            },
            product: product.id,
        }, false)

    return product
}


const NON_UPDATABLE_PRICE_PROPERTIES = ["unit_amount", "product", "currency", "recurring.interval"]

async function createOrUpdatePrice(
    priceKey: `${BillingPlan}/${"monthly" | "yearly"}`,
    priceData: Stripe.PriceCreateParams,
    setAsProductDefault?: boolean,
    skipSearch?: boolean,
) {
    const fullPriceData: Stripe.PriceCreateParams = {
        ...priceData,
        metadata: {
            wfd: "true",
            price_key: priceKey,
            ...priceData.metadata,
        },
    }

    const existingPrice = skipSearch ? undefined : await api.prices.search({
        query: `metadata["price_key"]:"${priceKey}" AND product:"${priceData.product}" AND active:"true"`,
    }).then(r => r.data[0])

    if (!existingPrice) {
        console.log(`Creating price ${priceKey}`)
        return api.prices.create(fullPriceData).then(async r => {
            if (setAsProductDefault) {
                await api.products.update(priceData.product!, {
                    default_price: r.id,
                })
            }
            return r
        })
    }

    const canBeUpdated = _isEqual(
        _pick(existingPrice, NON_UPDATABLE_PRICE_PROPERTIES),
        _pick(fullPriceData, NON_UPDATABLE_PRICE_PROPERTIES),
    )

    if (canBeUpdated) {
        const omittedPriceData = _omit(fullPriceData, NON_UPDATABLE_PRICE_PROPERTIES)
        const shouldBeUpdated = !_isEqual(
            _pick(existingPrice, Object.keys(omittedPriceData)),
            omittedPriceData,
        )
        if (shouldBeUpdated) {
            console.log(`Updating price ${priceKey}`)
            return api.prices.update(existingPrice.id, omittedPriceData)
        }
        console.log(`Nothing to update for price ${priceKey}`)
        return existingPrice
    }
    else {
        console.log(`Price ${priceKey} changed non-updatable properties, deleting and recreating`)
        const newPrice = await createOrUpdatePrice(priceKey, priceData, setAsProductDefault, true) as Stripe.Price
        await api.prices.update(existingPrice.id, { active: false })
        return newPrice
    }
}