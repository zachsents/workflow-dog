import { userHasProjectPermission } from "@web/lib/server/auth-checks"
import { db } from "@web/lib/server/db"
import { requireLogin } from "@web/lib/server/router"
import { getStripe, getStripeCustomerByProjectId } from "@web/lib/server/stripe"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"


export async function GET(
    req: NextRequest,
    { params: { projectId } }: { params: { projectId: string } }
) {
    const { user_id } = await requireLogin()
    const hasWritePerm = await userHasProjectPermission(user_id, "write")
        .byProjectId(projectId)

    if (!hasWritePerm)
        redirect(`/projects/${projectId}/usage?tm=You do not have permission to access billing for this project`)

    const stripe = getStripe()

    const [
        { id: customerId },
        projectName,
    ] = await Promise.all([
        getStripeCustomerByProjectId(stripe, projectId),
        db.selectFrom("projects")
            .select("name")
            .where("id", "=", projectId)
            .executeTakeFirstOrThrow()
            .then(r => r.name)
    ])

    const return_url = `${process.env.WEBAPP_URL}/projects/${projectId}/usage`

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
            description: `Subscription for project ${projectName}`,
            metadata: { projectId },
        },
    })

    return redirect(url!)
}