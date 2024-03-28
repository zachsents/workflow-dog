"use client"

import { cn } from "@web/lib/utils"


interface SelectionWrapperProps {
    selected: boolean
    children: any
}

export default function SelectionWrapper({ children, selected }: SelectionWrapperProps) {
    return (
        <div
            className={cn(
                "rounded-md outline-2 outline-offset-8",
                selected
                    ? "outline outline-violet-500"
                    : "group-hover/node:outline group-hover/node:outline-violet-400"
            )}
        >
            {children}
        </div>
    )
}