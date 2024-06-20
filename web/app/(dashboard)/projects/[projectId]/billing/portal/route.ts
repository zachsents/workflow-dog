import { userHasProjectPermission } from "@web/lib/server/auth-checks"
import { requireLogin } from "@web/lib/server/router"
import { getStripe, getStripeCustomerByProjectId } from "@web/lib/server/stripe"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"


export async function GET(
    _: NextRequest,
    { params: { projectId } }: { params: { projectId: string } }
) {
    const { user_id } = await requireLogin()
    const hasWritePerm = await userHasProjectPermission(user_id, "write")
        .byProjectId(projectId)

    if (!hasWritePerm)
        redirect(`/projects/${projectId}/usage?tm=You do not have permission to access billing for this project`)

    const stripe = getStripe()
    const { id: customerId } = await getStripeCustomerByProjectId(stripe, projectId)

    const { url } = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.WEBAPP_URL}/projects/${projectId}/usage`,
    })

    return redirect(url)
}