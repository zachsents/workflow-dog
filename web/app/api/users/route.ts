import { errorResponse } from "@web/lib/server/router"
import { getStripe, getStripeCustomerByUserId } from "@web/lib/server/stripe"
import { supabaseVerifyJWT } from "@web/lib/server/supabase"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {

    const verified = supabaseVerifyJWT(req, false)
    if (!verified) errorResponse("Unauthorized", 401)

    const { record: {
        id,
        email,
        raw_user_meta_data: { name }
    } } = await req.json()

    const stripe = getStripe()

    const doesCustomerExist = await getStripeCustomerByUserId(stripe, id)
        .then(Boolean)

    if (doesCustomerExist)
        return errorResponse("Customer already exists", 409)

    await stripe.customers.create({
        email,
        name,
        metadata: { userId: id },
    })

    console.log(`Created customer for ${email}`)

    return NextResponse.json({ success: true })
}