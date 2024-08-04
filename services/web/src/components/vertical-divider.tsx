import { cn } from "@web/lib/utils"
import { forwardRef } from "react"

const VerticalDivider = forwardRef<HTMLDivElement, React.ComponentProps<"div">>((props, ref) =>
    <div
        {...props}
        className={cn("w-[1px] self-stretch bg-gray-200 first:hidden last:hidden shrink-0", props.className)}
        ref={ref}
    />
)

export default VerticalDivider