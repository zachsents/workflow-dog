import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface SimpleTooltipProps {
    children: React.ReactNode
    tooltip: string | React.ReactNode
    triggerProps?: React.ComponentProps<typeof TooltipTrigger>
    contentProps?: React.ComponentProps<typeof TooltipContent>
}

export default function SimpleTooltip({
    children,
    tooltip,
    triggerProps,
    contentProps
}: SimpleTooltipProps) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger {...triggerProps}>
                    {children}
                </TooltipTrigger>
                <TooltipContent {...contentProps}>
                    {typeof tooltip === "string"
                        ? <p>
                            {tooltip}
                        </p>
                        : tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}