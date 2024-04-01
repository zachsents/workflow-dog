"use client"

import { cn } from "@web/lib/utils"
import { forwardRef } from "react"


interface SelectionWrapperProps extends React.ComponentPropsWithoutRef<"div"> {
    selected: boolean
}

const SelectionWrapper = forwardRef<HTMLDivElement, SelectionWrapperProps>(({
    selected,
    children,
    ...props
}, ref) => {
    return (
        <div
            {...props}
            className={cn(
                "rounded-md outline-2 outline-offset-8",
                selected
                    ? "outline outline-violet-500"
                    : "group-hover/node:outline group-hover/node:outline-violet-400",
                props.className,
            )}
            ref={ref}
        >
            {children}
        </div>
    )
})

export default SelectionWrapper