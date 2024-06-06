"use client"

import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover"
import { useCurrentWorkflowId, useDialogState } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useSelectedWorkflowRun, useWorkflow } from "@web/modules/workflows"
import { TbChevronDown, TbClockPlay, TbPlayerPlay, TbX } from "react-icons/tb"
import PastRunsTable from "./past-runs-table"
// import RunManuallyForm from "./run-manually-form"


export function RunManually() {
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
                Coming Soon
                {/* <RunManuallyForm onClose={popover.close} /> */}
            </PopoverContent>
        </Popover>
    )
}


export function PastRuns() {
    const popover = useDialogState()
    return (
        <Popover {...popover.dialogProps}>
            <PopoverTrigger asChild>
                <Button
                    size="sm" variant="ghost"
                    className="flex center gap-2 border border-muted-foreground pointer-events-auto"
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


export function MostRecentRun() {
    const workflowId = useCurrentWorkflowId()
    const { data: mostRecentRun } = trpc.workflows.runs.mostRecent.useQuery({
        workflowId
    })

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
                    #{mostRecentRun.numeric_id}
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


export function CurrentRunInfo() {

    const { data: selectedRun } = useSelectedWorkflowRun()
    const [, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")

    return (
        <>
            <p className="text-xs text-muted-foreground">
                Currently Viewing Run #{selectedRun?.numeric_id}
            </p>
            <Button
                size="sm" variant="ghost"
                className="pointer-events-auto flex center gap-2 border border-muted-foreground"
                onClick={() => setSelectedRunId(null)}
            >
                <TbX />
                Deselect Run
            </Button>
        </>
    )
}