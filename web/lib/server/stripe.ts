import "server-only"
import Stripe from "stripe"


export function getStripe() {
    return new Stripe(process.env.STRIPE_KEY!)
}


export async function getStripeCustomerByUserId<B extends boolean = false>(stripe: Stripe, userId: string, multiple?: B): Promise<B extends true ? Stripe.Customer[] : Stripe.Customer>


export async function getStripeCustomerByUserId(stripe: Stripe, userId: string, multiple = false) {
    const result = await stripe.customers.search({
        query: `metadata["userId"]:"${userId}"`,
    })

    return multiple ? result.data : result.data[0]
}