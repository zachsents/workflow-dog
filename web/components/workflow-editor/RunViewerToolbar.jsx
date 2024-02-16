import { Button, Card, Chip, Divider, Slider, Spinner } from "@nextui-org/react"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useRunWorkflowMutation, useSelectedWorkflowRun } from "@web/modules/workflows"
import classNames from "classnames"
import { TbRotateClockwise2, TbX } from "react-icons/tb"
import StatusIcon from "./StatusIcon"


export default function RunViewerToolbar() {

    const [selectedRunId, setSelectedRunId] = useEditorStoreState("selectedRunId")
    const isRunSelected = !!selectedRunId

    const { data: run, isLoading } = useSelectedWorkflowRun()

    const runMutation = useRunWorkflowMutation(run?.workflowId, {
        subscribe: true,
        mutationKey: ["rerun", run?.id],
    })
    const rerun = () => runMutation.mutate({ copyTriggerDataFrom: selectedRunId })

    return (
        <Card className={classNames("p-unit-xs transition-opacity flex flex-col items-stretch gap-unit-xs",
            isRunSelected ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
            {isLoading ?
                <Spinner size="sm" className="self-center" /> :
                <>
                    {run?.state?.errors?.workflow &&
                        <div className="bg-danger-100 rounded-lg p-unit-xs">
                            <p className="text-sm font-bold text-danger-600">
                                Couldn't run workflow
                            </p>
                            <p className="text-sm">
                                {run?.state?.errors?.workflow}
                            </p>
                        </div>}

                    <Divider className="first:hidden" />

                    <div className="flex items-center justify-between gap-unit-xl">
                        <p className="text-xs text-default-500">
                            Currently Viewing Run #{run?.count}
                        </p>
                        <div className="flex gap-unit-xs">
                            <Button
                                size="sm" variant="light" color="primary"
                                isLoading={runMutation.isPending}
                                startContent={<TbRotateClockwise2 />}
                                onPress={rerun}
                            >
                                Re-run
                            </Button>
                            <Button
                                size="sm" variant="light"
                                startContent={<TbX />}
                                onPress={() => setSelectedRunId(null)}
                            >
                                Deselect Run
                            </Button>
                        </div>
                    </div>

                    <Divider />

                    <div className="flex flex-col p-unit-xs gap-1">
                        <p className="text-xs text-default-500">
                            {new Date(run?.createdAt).toLocaleString(undefined, {
                                timeStyle: "short",
                                dateStyle: "medium",
                            })}
                        </p>
                        <StatusIcon
                            status={run?.status}
                            hasErrors={run?.hasErrors} errorCount={run?.errorCount}
                        />
                    </div>
                </>}
        </Card>
    )
}
