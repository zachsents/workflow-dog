import type { BillingPlan } from "core/db"
import type { Request, Response } from "express"
import Stripe from "stripe"
import { db } from "./db"
import { useEnvVar } from "./utils"


export const STRIPE_METADATA_KEYS = {
    WFD: "wfd",
    ENVIRONMENT: "wfd_environment",
    PLAN_KEY: "wfd_plan_key",
    FREQUENCY: "wfd_frequency",
}
export const STRIPE_PORTAL_CONFIG_KEY = "stripe_billing_portal_config_id"
export const STRIPE_FREE_PRICE_CONFIG_KEY = "stripe_free_price_id"


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
            // this shouldn't happen, but just in case:
            console.log(`Subscription deleted for project ${event.data.object.metadata.projectId}.This is a bug.`)
            break
        case "customer.subscription.updated": {
            const projectId = event.data.object.metadata.projectId
            if (!projectId)
                break

            const priceMetadata = event.data.object.items.data[0].price.metadata
            const isPriceForCurrentEnvironment =
                priceMetadata[STRIPE_METADATA_KEYS.WFD] === "true"
                && priceMetadata[STRIPE_METADATA_KEYS.ENVIRONMENT] === useEnvVar("ENVIRONMENT")

            if (!isPriceForCurrentEnvironment)
                break

            const planKey = priceMetadata[STRIPE_METADATA_KEYS.PLAN_KEY] as BillingPlan
            await db.updateTable("projects")
                .set({ billing_plan: planKey })
                .where("id", "=", projectId)
                .execute()

            console.log(`Updated project ${projectId} to plan ${planKey}`)
            break
        }
    }

    res.status(200).send("OK")
}

