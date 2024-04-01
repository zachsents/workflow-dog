"use client"

import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover"
import { useDialogState } from "@web/lib/client/hooks"
import { useEditorStore, useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useSelectedWorkflowRun, useWorkflowRunsRealtime } from "@web/modules/workflows"
import { TbChevronDown, TbClockPlay, TbPlayerPlay, TbX } from "react-icons/tb"
import PastRunsTable from "./past-runs-table"
import RunManuallyForm from "./run-manually-form"


export default function RunControls() {

    const hasSelectedRun = useEditorStore(s => !!s.selectedRunId)

    return (
        <div className="flex-v items-end gap-3">
            <div className="flex justify-end items-start gap-2">
                {!hasSelectedRun &&
                    <RunManually />}
                <PastRuns />
            </div>

            {hasSelectedRun
                ? <CurrentRunInfo />
                : <MostRecentRun />}
        </div>
    )
}


function RunManually() {
    const popover = useDialogState()
    return (
        <Popover {...popover.dialogProps}>
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
                <RunManuallyForm onClose={popover.close} />
            </PopoverContent>
        </Popover>
    )
}


function PastRuns() {

    const { data: runs } = useWorkflowRunsRealtime()
    const popover = useDialogState()
    
    return (
        <Popover {...popover.dialogProps}>
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
                <PastRunsTable onClose={popover.close} />
                {runs?.length === 0 &&
                    <p className="text-muted-foreground text-sm text-center p-8">
                        No runs yet
                    </p>}
            </PopoverContent>
        </Popover>
    )
}


function MostRecentRun() {

    const { data: runs } = useWorkflowRunsRealtime(undefined)
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