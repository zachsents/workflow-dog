import { errorResponse } from "@web/lib/server/router"
import { getStripe } from "@web/lib/server/stripe"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { NextRequest, NextResponse } from "next/server"
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


async function setBillingPlan(projectId: string, billing_plan: string | null, updateStartDate: boolean) {
    const supabase = await supabaseServerAdmin()
    await supabase
        .from("teams")
        .update({
            billing_plan: billing_plan as any,
            ...updateStartDate && {
                billing_start_date: new Date().toISOString().split("T")[0],
            },
        })
        .eq("id", projectId)
        .throwOnError()
}
