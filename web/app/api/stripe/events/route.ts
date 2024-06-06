import { db } from "@web/lib/server/db"
import { errorResponse } from "@web/lib/server/router"
import { getStripe } from "@web/lib/server/stripe"
import { sql } from "kysely"
import { NextRequest, NextResponse } from "next/server"
import { type BillingPlan } from "shared/db"
import Stripe from "stripe"


export async function POST(req: NextRequest) {

    const stripeSignature = req.headers.get("stripe-signature")
    if (!stripeSignature) return errorResponse("Unauthorized", 401)

    const stripe = getStripe()

    try {
        var event = stripe.webhooks.constructEvent(
            await req.text(),
            stripeSignature,
            process.env.STRIPE_WEBHOOK_SIGNING_SECRET!
        )
    }
    catch (err) {
        return errorResponse(err.message, 400)
    }

    await EventHandlers[event.type]?.(event)

    return NextResponse.json({ success: true })
}


type EventHandlersRecord = Partial<{ [key in Stripe.Event["type"]]: (event: Stripe.Event) => Promise<void> }>

const EventHandlers: EventHandlersRecord = {
    "customer.subscription.created": async (event) => {
        const sub = event.data.object as Stripe.Subscription
        await setBillingPlan(sub.metadata.projectId, "pro", true)
    },
    "customer.subscription.deleted": async (event) => {
        const sub = event.data.object as Stripe.Subscription
        await setBillingPlan(sub.metadata.projectId, null, false)
    },
}


async function setBillingPlan(
    projectId: string,
    billingPlan: BillingPlan | null,
    updateStartDate: boolean,
) {
    await db.updateTable("projects")
        .set({
            billing_plan: billingPlan,
            ...updateStartDate && {
                billing_start_date: sql`current_date`,
            },
        })
        .where("id", "=", projectId)
        .executeTakeFirstOrThrow()
}
