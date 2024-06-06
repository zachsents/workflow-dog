import "server-only"
import Stripe from "stripe"
import { db } from "./db"


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


/**
 * Looks up the Stripe customer object for a project. Modeling Stripe Customers as
 * WorkflowDog Projects because it makes sense to have a 1:1 relationship.
 * 
 * Also optionally creates a Stripe customer if one does not exist.
 */
export async function getStripeCustomerByProjectId(stripe: Stripe, projectId: string, createIfNotExists?: boolean) {

    const result = await stripe.customers.search({
        query: `metadata["projectId"]:"${projectId}"`,
    })

    if (result.data.length > 0)
        return result.data[0]

    if (!createIfNotExists)
        throw new Error(`Couldn't find customer for project ID ${projectId}`)

    const { name, email } = await db.selectFrom("projects")
        .leftJoin("auth.users", "auth.users.id", "projects.creator")
        .select(["projects.name", "auth.users.email"])
        .where("id", "=", projectId)
        .executeTakeFirstOrThrow()

    return await stripe.customers.create({
        name,
        ...email && { email },
        metadata: {
            projectId,
        },
    })
}