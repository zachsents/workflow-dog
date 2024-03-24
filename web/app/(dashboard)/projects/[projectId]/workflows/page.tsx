import { Button } from "@ui/button"
import WorkflowsTable from "./_components/workflows-table"
import { TbPlus } from "react-icons/tb"


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

            <Button>
                <TbPlus className="mr-2" />
                Create Workflow
            </Button>
        </div>

        <WorkflowsTable projectId={projectId} />
    </>)
}
