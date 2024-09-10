import { IconRefresh } from "@tabler/icons-react"
import { useEffect } from "react"
import SimpleTooltip from "web/src/components/simple-tooltip"
import TI from "web/src/components/tabler-icon"
import { Button } from "web/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web/src/components/ui/select"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { useCurrentWorkflowId } from "web/src/lib/hooks"
import { trpc } from "web/src/lib/trpc"


export default function OtherWorkflowsSelector() {

    const workflowId = useCurrentWorkflowId()

    const utils = trpc.useUtils()
    const trpcArgs = {
        workflowId,
        excluding: [workflowId],
    }
    const { data: otherWorkflows, isLoading } = trpc.workflows.listCallable.useQuery(trpcArgs)

    const gbx = useGraphBuilder()
    const nodeId = useNodeId()

    const selectedWorkflow = gbx.useNodeState<string | null | undefined>(nodeId, n => n.config.selectedWorkflow)
    const setSelectedWorkflow = (value: string | null) => void gbx.mutateNodeState(nodeId, n => {
        n.config.selectedWorkflow = value || null
    })

    useEffect(() => {
        if (selectedWorkflow && otherWorkflows && !otherWorkflows.some(wf => wf.id === selectedWorkflow))
            setSelectedWorkflow(null)
    }, [otherWorkflows, selectedWorkflow])

    return (
        <div className="flex-center gap-2">
            <Select disabled={isLoading} value={selectedWorkflow ?? ""} onValueChange={setSelectedWorkflow}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={isLoading ? "Loading..." : "Pick a workflow"} />
                </SelectTrigger>
                <SelectContent className="max-w-[240px]">
                    {otherWorkflows?.map(wf =>
                        <SelectItem key={wf.id} value={wf.id}>
                            {wf.name}
                        </SelectItem>
                    )}
                    {otherWorkflows?.length === 0 &&
                        <p className="text-xs text-muted-foreground text-center p-2">
                            No other workflows found. Try creating one with a Callable trigger, or unpausing the workflow you're looking for.
                        </p>}
                </SelectContent>
            </Select>
            <SimpleTooltip tooltip="Refresh list">
                <Button
                    className="shrink-0" variant="ghost" size="icon"
                    onClick={() => utils.workflows.listCallable.invalidate(trpcArgs)}
                >
                    <TI className="text-muted-foreground"><IconRefresh /></TI>
                </Button>
            </SimpleTooltip>
        </div>
    )
}