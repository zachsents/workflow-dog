import CreateWorkflow from "./_components/create-workflow"
import WorkflowsTable from "./_components/workflows-table"


export default function WorkflowsPage({
    params: { projectId },
}: {
    params: { projectId: string }
}) {
    return (<>
        <div className="flex justify-between gap-10">
            <h1 className="text-2xl font-bold">
                Workflows
            </h1>

            <CreateWorkflow />
        </div>

        <WorkflowsTable projectId={projectId} />
    </>)
}
