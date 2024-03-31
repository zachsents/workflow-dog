"use client"

import { Button } from "@web/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover"
import { useDialogState } from "@web/lib/client/hooks"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useWorkflowRun, useWorkflowRunsRealtime } from "@web/modules/workflows"
import { TbChevronDown, TbClockPlay, TbPlayerPlay, TbX } from "react-icons/tb"
import PastRunsTable from "./past-runs-table"
import RunManuallyForm from "./run-manually-form"
import { Badge } from "@web/components/ui/badge"


export default function RunControls() {

    const { data: runs } = useWorkflowRunsRealtime(undefined)
    const mostRecentRun = runs?.[0]

    const [selectedRunId, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")
    const { data: selectedRun } = useWorkflowRun(selectedRunId!)

    const runnerPopover = useDialogState()
    const viewerPopover = useDialogState()

    return (
        <div className="flex-v items-end gap-3">
            <div className="flex justify-end items-start gap-2">
                <Popover {...runnerPopover.dialogProps}>
                    <PopoverTrigger>
                        <Button
                            size="sm"
                            className="pointer-events-auto flex center gap-2 shadow-lg"
                        >
                            <TbPlayerPlay />
                            Run Manually
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-h-[36rem] overflow-y-auto p-2">
                        <RunManuallyForm onClose={runnerPopover.close} />
                    </PopoverContent>
                </Popover>
                <Popover {...viewerPopover.dialogProps}>
                    <PopoverTrigger>
                        <Button
                            size="sm" variant="outline"
                            className="pointer-events-auto flex center gap-2 bg-white/80 backdrop-blur-sm shadow-lg"
                        >
                            <TbClockPlay />
                            View Runs
                            <TbChevronDown />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto max-h-[36rem] p-0 overflow-y-auto shadow-lg z-[60]">
                        <PastRunsTable onClose={viewerPopover.close} />
                        {runs?.length === 0 &&
                            <p className="text-muted-foreground text-sm text-center p-8">
                                No runs yet
                            </p>}
                    </PopoverContent>
                </Popover>
            </div>

            {selectedRunId ?
                <>
                    <p className="text-xs text-muted-foreground mt-2">
                        Currently Viewing Run #{selectedRun?.count}
                    </p>
                    <Button
                        size="sm" variant="outline"
                        className="bg-white/80 backdrop-blur-sm shadow-lg pointer-events-auto flex center gap-2"
                        onClick={() => setSelectedRunId(null)}
                    >
                        <TbX />
                        Deselect Run
                    </Button>
                </> :
                mostRecentRun ?
                    <>
                        {/* <p className="text-xs text-muted-foreground mt-2">
                            Most recent run
                        </p> */}
                        <Button
                            size="sm" variant="outline"
                            className="bg-white/80 backdrop-blur-sm shadow-lg pointer-events-auto flex center gap-2"
                            onClick={() => setSelectedRunId(mostRecentRun.id)}
                        >
                            <Badge variant="secondary">Latest Run</Badge>
                            <span>
                                #{mostRecentRun.count}
                            </span>
                            <span className="text-muted-foreground">
                                {new Date(mostRecentRun.created_at).toLocaleString(undefined, {
                                    timeStyle: "short",
                                    dateStyle: "medium",
                                })}
                            </span>
                        </Button>
                    </> : null}
        </div>
    )
}
