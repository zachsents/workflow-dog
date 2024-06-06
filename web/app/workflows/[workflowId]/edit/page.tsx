import { userHasProjectPermission } from "@web/lib/server/auth-checks"
import { db } from "@web/lib/server/db"
import { requireLogin } from "@web/lib/server/router"
import { redirect } from "next/navigation"
import EditorRenderer from "./_components/renderer"


export default async function EditWorkflowPage({
    params: { workflowId }
}: {
    params: { workflowId: string }
}) {
    const { user_id } = await requireLogin()

    const hasWritePerm = await userHasProjectPermission(user_id, "write")
        .byWorkflowId(workflowId)
    if (!hasWritePerm) {
        const projectId = await db.selectFrom("workflows")
            .select("project_id")
            .where("id", "=", workflowId)
            .executeTakeFirst()
            .then(w => w?.project_id)

        redirect(
            projectId
                ? `/projects/${projectId}/workflows`
                : "/projects"
        )
    }

    return (
        <div className="flex-v items-stretch h-screen overflow-clip">
            <EditorRenderer />
        </div>
    )
}