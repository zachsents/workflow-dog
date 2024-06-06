"use client"

import { Badge } from "@ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import Loader from "@web/components/loader"
import { useCurrentWorkflowId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { cn } from "@web/lib/utils"
import { useWorkflow } from "@web/modules/workflows"

export default function WorkflowStatusBadge() {

    const workflowId = useCurrentWorkflowId()
    const { data: workflow, isSuccess: hasWorkflowLoaded } = useWorkflow()
    const isEnabled = workflow?.is_enabled || false

    const utils = trpc.useUtils()

    const { mutate, isPending } = trpc.workflows.setEnabled.useMutation({
        onSuccess: () => void utils.workflows.byId.invalidate({
            id: workflowId,
        }),
    })
    const toggleEnabled = () => mutate({
        workflowId,
        isEnabled: !isEnabled,
    })

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger>
                    <Badge
                        variant={isEnabled ? "default" : "secondary"}
                        className={cn(
                            "mb-0.5",
                            isEnabled && "bg-green-500 hover:bg-green-700",
                            isPending && "opacity-50 pointer-events-none cursor-not-allowed",
                            !hasWorkflowLoaded && "text-transparent",
                        )}
                        onClick={toggleEnabled}
                        aria-disabled={isPending}
                    >
                        {isPending && <Loader mr />}
                        {isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isEnabled ? "Disable" : "Enable"} workflow?</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}