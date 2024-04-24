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
    const { id: customerId } = await getStripeCustomerByUserId(stripe, user.id)

    const { url } = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.APP_URL}/projects/${projectId}/usage`,
    })

    return NextResponse.redirect(url)
}