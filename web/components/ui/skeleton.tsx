import { cn } from "@web/lib/utils"
import { TbLoader3 } from "react-icons/tb"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    withLoader?: boolean
}

function Skeleton({
    withLoader,
    className,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-secondary/80 flex center", className)}
            {...props}
        >
            {withLoader &&
                <TbLoader3 className="animate-spin opacity-50" />}
        </div>
    )
}

export { Skeleton }
