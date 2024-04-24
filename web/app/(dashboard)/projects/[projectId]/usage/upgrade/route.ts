import { getStripe, getStripeCustomerByUserId } from "@web/lib/server/stripe"
import { supabaseServer } from "@web/lib/server/supabase"
import { NextRequest, NextResponse } from "next/server"


export async function GET(
    req: NextRequest,
    { params: { projectId } }: { params: { projectId: string } }
) {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user)
        return NextResponse.redirect("/login")

    const stripe = getStripe()

    const [
        { id: customerId },
        projectQuery
    ] = await Promise.all([
        getStripeCustomerByUserId(stripe, user.id),
        supabase
            .from("teams")
            .select("name")
            .eq("id", projectId)
            .single()
            .throwOnError()
    ])

    const return_url = `${process.env.APP_URL}/projects/${projectId}/usage`

    const { url } = await stripe.checkout.sessions.create({
        customer: customerId,
        metadata: { projectId },
        mode: "subscription",
        allow_promotion_codes: true,
        cancel_url: return_url,
        success_url: return_url + "?success",
        line_items: [{
            price: req.nextUrl.searchParams.has("annual")
                ? "price_1P4edrHYINHn5cdTV24nAyTl"
                : "price_1P4edrHYINHn5cdTwJG1Q1Z6",
            quantity: 1,
        }],
        subscription_data: {
            description: `Subscription for project ${projectQuery.data?.name || "Unknown"}`,
            metadata: { projectId },
        },
    })

    return NextResponse.redirect(url!)
}