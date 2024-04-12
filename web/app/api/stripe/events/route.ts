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
            await req.json(),
            stripeSignature,
            process.env.STRIPE_WEBHOOK_SIGNING_SECRET!
        )
    }
    catch (err) {
        return errorResponse(err.message, 400)
    }

    switch (event.type) {
        case "customer.subscription.created":
            console.log("Subscription created")
            await handleNewSubscription(event.data.object as Stripe.Subscription)
            break
        case "customer.subscription.deleted":
            console.log("Subscription deleted")
            break
        case "customer.subscription.updated":
            console.log("Subscription updated")
            break
    }

    return NextResponse.json({ success: true })
}


async function handleNewSubscription(subscription: Stripe.Subscription) {

    const projectId = subscription.metadata.projectId
    if (!projectId) return

    const supabase = await supabaseServerAdmin()
    await supabase
        .from("teams")
        .update({ billing_plan: "pro" })
        .eq("id", projectId)
        .throwOnError()
}