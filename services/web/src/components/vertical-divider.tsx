import { cn } from "@web/lib/utils"
import { forwardRef } from "react"

interface VerticalDividerProps extends React.ComponentProps<"div"> {
    alwaysShow?: boolean
}

const VerticalDivider = forwardRef<HTMLDivElement, VerticalDividerProps>(({ alwaysShow, ...props }, ref) =>
    <div
        {...props}
        className={cn(
            "w-[1px] self-stretch bg-gray-200 shrink-0",
            !alwaysShow && "first:hidden last:hidden",
            props.className,
        )}
        ref={ref}
    />
)

export default VerticalDivider