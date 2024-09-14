import Stripe from "stripe"
import { useEnvVar } from "./utils"
import type { Request, Response } from "express"
import { db } from "./db"
import type { BillingPlan } from "core/db"


const api = new Stripe(useEnvVar("STRIPE_KEY"))
export { api as stripe }


export async function handleWebhookRequest(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"]
    if (!signature)
        return res.status(400).send("No signature header provided")

    try {
        var event = api.webhooks.constructEvent(req.body, signature, useEnvVar("STRIPE_WEBHOOK_SIGNING_SECRET"))
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