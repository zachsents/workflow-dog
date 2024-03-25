import { requireLogin } from "@web/lib/server/supabase"
import EditWorkflowHeader from "./_components/header"


export default async function EditWorkflowPage({
    // params: { workflowId }
}: {
    params: { workflowId: string }
}) {
    await requireLogin()

    return (
        <EditWorkflowHeader />
    )
}