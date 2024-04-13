import { errorResponse } from "@web/lib/server/router"
import { getStripe } from "@web/lib/server/stripe"
import { supabaseVerifyJWT } from "@web/lib/server/supabase"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {

    const verified = supabaseVerifyJWT(req, false)
    if (!verified) errorResponse("Unauthorized", 401)

    const change = await req.json()

    if (change.record.name !== change.old_record.name) {
        // Update the subscription description with the new project name

        const stripe = getStripe()

        const subscription = await stripe.subscriptions.search({
            query: `metadata["projectId"]:"${change.record.id}"`,
        }).then(result => result.data[0])

        if (subscription) {
            await stripe.subscriptions.update(subscription.id, {
                description: `Subscription for project ${change.record.name || "Unknown"}`,
            })
        }
    }

    return NextResponse.json({ success: true })
}