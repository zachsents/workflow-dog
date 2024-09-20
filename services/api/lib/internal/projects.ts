import type { DB } from "core/db"
import type { Kysely, Transaction } from "kysely"
import { db } from "../db"
import { stripe, STRIPE_FREE_PRICE_CONFIG_KEY } from "../stripe"
import { useEnvVar } from "../utils"


export async function createProject(projectData: {
    name: string
    creator: string
}, {
    dbHandle = db,
}: {
    dbHandle?: Kysely<DB> | Transaction<DB>
} = {}) {
    const freePriceId = await db.selectFrom("general_config")
        .select("value")
        .where("key", "=", STRIPE_FREE_PRICE_CONFIG_KEY)
        .executeTakeFirst()
        .then(r => r?.value)

    if (!freePriceId)
        throw new Error("Free price ID not found. Sync to Stripe.")

    const [newProject, userInfo] = await Promise.all([
        dbHandle.insertInto("projects")
            .values({
                name: projectData.name,
                creator: projectData.creator,
            })
            .returning(["id"])
            .executeTakeFirstOrThrow(),
        db.selectFrom("user_meta")
            .select(["name", "email"])
            .where("id", "=", projectData.creator)
            .executeTakeFirst(),
    ])

    await Promise.all([
        dbHandle.insertInto("projects_users")
            .values({
                project_id: newProject.id,
                user_id: projectData.creator,
            })
            .executeTakeFirst(),

        stripe.customers.create({
            name: userInfo?.name ?? undefined,
            email: userInfo?.email ?? undefined,
            description: `Project "${projectData.name}"`,
            metadata: {
                projectId: projectData.creator,
                site: useEnvVar("APP_ORIGIN"),
            },
        }).then(async customer => {
            const sub = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{
                    price: freePriceId,
                }],
                description: `Subscription for Project "${projectData.name}"`,
                metadata: {
                    projectId: projectData.creator,
                    site: useEnvVar("APP_ORIGIN"),
                },
            })
            return [customer.id, sub.id] as const
        }).then(([customerId, subscriptionId]) =>
            dbHandle.updateTable("projects")
                .set({
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                })
                .where("id", "=", newProject.id)
                .executeTakeFirstOrThrow()
        ),
    ])

    return newProject
}


/**
 * Calculates the start and end dates of the current billing period.
 * Simply a function of the billing start date in order to avoid the
 * need for cron jobs to reset any billing quotas.
 */
export function getCurrentBillingPeriod(billingStartDate: Date) {
    const staticDay = billingStartDate.getUTCDate()

    const now = new Date()
    const currentMonth = now.getUTCMonth()
    const currentYear = now.getUTCFullYear()
    const thisMonthsDay = new Date(Date.UTC(currentYear, currentMonth, staticDay))

    return now < thisMonthsDay ? {
        start: new Date(Date.UTC(currentYear, currentMonth - 1, staticDay)),
        end: thisMonthsDay,
    } : {
        start: thisMonthsDay,
        end: new Date(Date.UTC(currentYear, currentMonth + 1, staticDay)),
    }
}