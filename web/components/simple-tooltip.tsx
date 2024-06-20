import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface SimpleTooltipProps {
    children: React.ReactNode
    tooltip: string | React.ReactNode
    triggerProps?: React.ComponentProps<typeof TooltipTrigger>
    contentProps?: React.ComponentProps<typeof TooltipContent>
    delay?: number
}

export default function SimpleTooltip({
    children,
    tooltip,
    triggerProps,
    contentProps,
    delay = 0,
}: SimpleTooltipProps) {
    return (
        <TooltipProvider delayDuration={delay}>
            <Tooltip>
                <TooltipTrigger asChild {...triggerProps}>
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