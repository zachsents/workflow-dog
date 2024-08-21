import { IconLoader2, IconLoader3 } from "@tabler/icons-react"
import { cn } from "@web/lib/utils"
import { forwardRef } from "react"
import TI from "./tabler-icon"


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


export const BrandLoader = forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
    iconProps?: Omit<React.ComponentProps<typeof TI>, "children">
    imgProps?: Omit<React.ComponentProps<"img">, "src">
}>(({ iconProps, imgProps, ...props }, ref) =>
    <div
        {...props}
        ref={ref}
        className={cn("relative flex-center gap-2", props.className)}
    >
        <img
            src="/logo.svg"
            {...imgProps}
            className={cn("w-[0.4em] aspect-square animate-bulge", imgProps?.className)}
        />
        <div className="absolute hack-center">
            <TI {...iconProps} className={cn("text-[1em] stroke-[0.5px] animate-spin", iconProps?.className)}>
                <IconLoader2 />
            </TI>
        </div>
    </div>
)
BrandLoader.displayName = "BrandLoader"