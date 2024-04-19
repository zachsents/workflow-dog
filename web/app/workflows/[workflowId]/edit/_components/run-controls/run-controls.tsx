"use client"

import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover"
import { useDialogState } from "@web/lib/client/hooks"
import { useEditorStore, useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useSelectedWorkflowRun, useWorkflow, useWorkflowRuns } from "@web/modules/workflows"
import { TbChevronDown, TbClockPlay, TbPlayerPlay, TbX } from "react-icons/tb"
import PastRunsTable from "./past-runs-table"
import RunManuallyForm from "./run-manually-form"


export default function RunControls() {

    const hasSelectedRun = useEditorStore(s => !!s.selectedRunId)

    return (
        <>
            {!hasSelectedRun &&
                <RunManually />}
            <PastRuns />

            {hasSelectedRun
                ? <CurrentRunInfo />
                : /* <MostRecentRun /> */ null}
        </>
    )
}


function RunManually() {
    const { data: workflow } = useWorkflow()
    const isEnabled = workflow?.is_enabled ?? false

    const popover = useDialogState()
    return (
        <Popover {...popover.dialogProps}>
            <PopoverTrigger asChild>
                <Button
                    size="sm" variant="ghost"
                    className="flex center gap-2 border border-muted-foreground"
                    disabled={!isEnabled}
                >
                    <TbPlayerPlay />
                    Run Manually
                    <TbChevronDown />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[28rem] max-h-[40rem] overflow-y-auto p-3 mx-2"
                side="bottom" sideOffset={10} align="center"
            >
                <RunManuallyForm onClose={popover.close} />
            </PopoverContent>
        </Popover>
    )
}


function PastRuns() {
    const popover = useDialogState()
    return (
        <Popover {...popover.dialogProps}>
            <PopoverTrigger asChild>
                <Button
                    size="sm" variant="ghost"
                    className="flex center gap-2 border border-muted-foreground"
                >
                    <TbClockPlay />
                    View Past Runs
                    <TbChevronDown />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto max-h-[40rem] p-0 overflow-y-auto shadow-lg z-[60]"
                side="bottom" sideOffset={10} align="center"
            >
                <PastRunsTable onClose={popover.close} />
            </PopoverContent>
        </Popover>
    )
}


function MostRecentRun() {
    const { data: runs } = useWorkflowRuns(undefined)
    const mostRecentRun = runs?.[0]

    const [, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")

    return mostRecentRun ?
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
        </> : null
}


function CurrentRunInfo() {

    const { data: selectedRun } = useSelectedWorkflowRun()
    const [, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")

    return (
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
        </>
    )
}