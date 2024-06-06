import { db } from "@web/lib/server/db"
import { requireLogin } from "@web/lib/server/router"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { type NextRequest } from "next/server"


export async function GET(
    _: NextRequest,
    { params: { invitationId } }: { params: { invitationId: string } }
) {
    const { email } = await requireLogin({
        beforeRedirect: () => {
            const cookieStore = cookies()
            cookieStore.set("accepting_invitation", invitationId)
        },
        params: { tm: "You need to log in first" },
    })

    const invitation = await db.selectFrom("project_invitations")
        .selectAll()
        .where("id", "=", invitationId)
        .executeTakeFirst()

    if (!invitation)
        return redirect("/projects?tm=That invitation was invalid")

    if (invitation.invitee_email !== email)
        return redirect(`/projects?tm=That invitation was not for you (${email})`)

    await db.insertInto("projects_users")
        .values(({ selectFrom }) => ({
            project_id: invitation.project_id,
            user_id: selectFrom("auth.users")
                .select("id")
                .where("email", "=", invitation.invitee_email)
        }))
        .executeTakeFirstOrThrow()

    await db.deleteFrom("project_invitations")
        .where("id", "=", invitationId)
        .executeTakeFirstOrThrow()

    revalidatePath("/projects", "layout")
    redirect(`/projects/${invitation.project_id}/workflows?tm=Welcome to the project!`)
}