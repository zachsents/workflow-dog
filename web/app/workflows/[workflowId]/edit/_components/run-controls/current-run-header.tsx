"use client"

import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Button } from "@web/components/ui/button"
import { Separator } from "@web/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@web/components/ui/tooltip"
import { cn } from "@web/lib/utils"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useSelectedWorkflowRun, useWorkflow } from "@web/modules/workflows"
import { TbX } from "react-icons/tb"


export default function CurrentRunHeader() {

    const { data: workflow } = useWorkflow()

    const [selectedRunId, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")
    const hasSelectedRun = !!selectedRunId
    const { data: run, isSuccess: hasRunLoaded } = useSelectedWorkflowRun()

    return (
        <div
            className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 z-50 h-11 flex center flex-nowrap gap-10 text-primary-foreground bg-slate-800 px-4 py-1 rounded-b-lg shadow-lg transition",
                !(hasSelectedRun && hasRunLoaded) && "-translate-y-[110%] shadow-none",
            )}
        >
            <div className="flex center gap-4 text-sm">
                <p className="opacity-75">
                    {workflow?.name}
                </p>
                <Separator orientation="vertical" className="h-[1em]" />
                <p>
                    <span className="opacity-75">Run #</span>
                    <span className="font-bold">{run?.count}</span>
                </p>
            </div>

            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            size="icon" variant="ghost"
                            onClick={() => setSelectedRunId(null)}
                        >
                            <TbX />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Deselect run</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </div>
    )
}