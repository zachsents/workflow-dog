import { IconLoader3 } from "@tabler/icons-react"
import { forwardRef } from "react"
import TI from "./tabler-icon"
import { cn } from "@web/lib/utils"


const SpinningLoader = forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
    iconProps?: Omit<React.ComponentProps<typeof TI>, "children">
}>(({ children, iconProps, ...props }, ref) =>
    <div
        {...props}
        ref={ref}
        className={cn("flex-center gap-2", props.className)}
    >
        <TI {...iconProps} className={cn("animate-spin", iconProps?.className)}>
            <IconLoader3 />
        </TI>
        {children}
    </div>
)
SpinningLoader.displayName = "SpinningLoader"
export default SpinningLoader