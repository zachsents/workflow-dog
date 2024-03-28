"use client"

import { useDisabled } from "@web/modules/workflow-editor/graph/nodes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import { cn } from "@web/lib/utils"

export default function DisabledWrapper({ children }: { children: any }) {

    const [disabled, upstreamDisabled, , disabledMessage] = useDisabled()
    const isDisabledAtAll = disabled || upstreamDisabled

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip open={isDisabledAtAll ? undefined : false}>
                <TooltipTrigger className={cn(
                    isDisabledAtAll && "opacity-40"
                )}>
                    {children}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>{disabledMessage}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}