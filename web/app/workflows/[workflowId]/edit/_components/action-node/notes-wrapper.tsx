"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import { cn } from "@web/lib/utils"
import { useDisabled } from "@web/modules/workflow-editor/graph/nodes"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import { useNodeId } from "reactflow"

export default function NotesWrapper({ children }: { children: any }) {

    const nodeId = useNodeId()

    const [disabled, upstreamDisabled, , disabledMessage] = useDisabled()
    const isDisabledAtAll = disabled || upstreamDisabled

    const { data: selectedRun, isSuccess: hasSelectedRun } = useSelectedWorkflowRun()
    const runState = selectedRun?.state as any
    const hasRunError = nodeId! in (runState?.errors || {})
    const runError = hasRunError ? runState?.errors[nodeId!] : null

    const isOpen = hasSelectedRun
        ? (isDisabledAtAll || hasRunError)
        : isDisabledAtAll
            ? undefined
            : false

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip open={isOpen}>
                <TooltipTrigger className={cn(
                    isDisabledAtAll && "opacity-40"
                )}>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side="bottom" avoidCollisions={false}
                    className="max-w-xs flex-v gap-2"
                >
                    {isDisabledAtAll &&
                        <p>{disabledMessage}</p>}

                    {hasRunError &&
                        <p className="text-red-400">
                            <b>Error:</b> {runError}
                        </p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}