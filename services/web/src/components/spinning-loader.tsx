import { IconLoader3 } from "@tabler/icons-react"
import React from "react"
import TI from "./tabler-icon"
import { cn } from "@web/lib/utils"


export default function SpinningLoader(props: Omit<React.ComponentProps<typeof TI>, "children">) {
    return (
        <TI {...props} className={cn("animate-spin", props.className)}>
            <IconLoader3 />
        </TI>
    )
}