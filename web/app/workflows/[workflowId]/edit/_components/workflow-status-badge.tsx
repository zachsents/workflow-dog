"use client"

import { Badge } from "@ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import Loader from "@web/components/loader"
import { cn } from "@web/lib/utils"
import { useSupabaseMutation } from "@web/modules/db"
import { useWorkflow } from "@web/modules/workflows"

export default function WorkflowStatusBadge() {

    const { data: workflow, isSuccess: hasWorkflowLoaded } = useWorkflow()
    const isEnabled = workflow?.is_enabled || false

    const setEnabled = useSupabaseMutation(
        (supabase) => supabase
            .from("workflows")
            .update({ is_enabled: !isEnabled })
            .eq("id", workflow?.id!) as any,
        {
            enabled: !!workflow,
            invalidateKey: ["workflow", workflow?.id],
        }
    )

    const { isPending } = setEnabled

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
                        onClick={() => void setEnabled.mutate(null)}
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