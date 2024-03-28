import { requireLogin } from "@web/lib/server/supabase"
import EditWorkflowHeader from "./_components/header"
import EditorRenderer from "./_components/renderer"


export default async function EditWorkflowPage({
    // params: { workflowId }
}: {
    params: { workflowId: string }
}) {
    await requireLogin()

    return (
        <div className="flex-v items-stretch h-screen overflow-clip">
            <EditWorkflowHeader />
            <EditorRenderer />
        </div>
    )
}