import Loader from "@web/components/loader"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { Separator } from "@web/components/ui/separator"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useRunWorkflowMutation, useSelectedWorkflowRun } from "@web/modules/workflows"
import { TbRotateClockwise2, TbX } from "react-icons/tb"
import StatusIcon from "./status-icon"


export default function RunViewerToolbar() {

    const [selectedRunId, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")

    const { data: run, isLoading } = useSelectedWorkflowRun()
    const runState = run?.state as any

    const runMutation = useRunWorkflowMutation(run?.workflow_id || "", {
        subscribe: true,
        mutationKey: ["rerun", run?.id],
    })
    const rerun = () => runMutation.mutate({
        copyTriggerDataFrom: selectedRunId,
    })

    return (
        <Card className="p-2 shadow-lg pointer-events-auto">
            {isLoading ?
                <div className="flex center">
                    <Loader className="self-center" />
                </div> :
                <div className="flex-v items-stretch gap-2">
                    {runState?.errors?.workflow &&
                        <div className="bg-red-100 rounded-lg p-2">
                            <p className="text-sm font-bold text-red-600">
                                Couldn't run workflow
                            </p>
                            <p className="text-sm">
                                {runState?.errors?.workflow}
                            </p>
                        </div>}

                    <Separator className="first:hidden" />

                    <div className="flex center gap-4 px-2">
                        <div>
                            <p
                                className="text-sm text-muted-foreground"
                                onDoubleClick={() => window.navigator.clipboard.writeText(run?.id || "")}
                            >
                                Run #<b>{run?.count}</b>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {run?.created_at
                                    ? new Date(run.created_at).toLocaleString(undefined, {
                                        timeStyle: "short",
                                        dateStyle: "medium",
                                    })
                                    : "-"}
                            </p>
                        </div>

                        <Separator orientation="vertical" className="h-6" />

                        <StatusIcon
                            status={run?.status}
                            hasErrors={run?.has_errors} errorCount={run?.error_count}
                        />

                        <Separator orientation="vertical" className="h-6" />

                        <div className="flex center gap-2">
                            <Button
                                size="sm" variant="secondary"
                                disabled={runMutation.isPending}
                                onClick={rerun}
                            >
                                {runMutation.isPending
                                    ? <Loader mr />
                                    : <TbRotateClockwise2 className="mr-2" />}
                                Re-run
                            </Button>
                            <Button
                                size="sm" variant="secondary"
                                onClick={() => setSelectedRunId(null)}
                            >
                                <TbX className="mr-2" />
                                Deselect Run
                            </Button>
                        </div>
                    </div>
                </div>}
        </Card>
    )
}
