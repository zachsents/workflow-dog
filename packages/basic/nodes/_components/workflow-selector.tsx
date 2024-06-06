import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import { Button } from "@web/components/ui/button"
import { useCurrentWorkflowId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import { TbExclamationCircle, TbThumbUpFilled } from "react-icons/tb"


export default function WorkflowSelector() {

    const [workflowId, setWorkflowId] = useNodeProperty<string>(undefined, "data.state.workflow")

    const projectId = useWorkflow().data?.project_id
    const { data: workflows, isLoading } = trpc.workflows.list.useQuery({
        projectId: projectId!,
        onlyRunnable: true,
    }, {
        enabled: !!projectId,
    })

    const currentWorkflowId = useCurrentWorkflowId()
    const [loopWarningDismissed, setLoopWarningDismissed] = useNodeProperty(undefined, "data.state.loopWarningDismissed", {
        defaultValue: false,
    })
    const showLoopWarning = currentWorkflowId === workflowId && !loopWarningDismissed

    return (
        <div className="mt-1 self-stretch">
            <p className="text-xs font-medium text-left">Workflow</p>
            <Select
                value={workflowId ?? ""}
                onValueChange={setWorkflowId}
            >
                <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select a workflow"} />
                </SelectTrigger>
                <SelectContent>
                    {workflows?.map(w =>
                        <SelectItem value={w.id} key={w.id}>
                            {w.name}
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
            {showLoopWarning &&
                <div className="mt-1 flex items-center gap-2 bg-red-100 text-destructive rounded-md px-2 py-1 w-min min-w-full">
                    <TbExclamationCircle />
                    <div className="flex-1">
                        <p className="text-xs text-left">
                            Be very careful! This could create an infinite loop.
                        </p>
                        <Button
                            size="sm" variant="ghost"
                            className="self-end flex center gap-2 py-0.5 h-auto ml-auto"
                            onClick={() => setLoopWarningDismissed(true)}
                        >
                            <TbThumbUpFilled />
                            Got it
                        </Button>
                    </div>
                </div>}
        </div>
    )
}