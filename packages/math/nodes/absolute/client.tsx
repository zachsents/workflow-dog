import { createClientNodeDefinition } from "@pkg/types"
import { cn } from "@web/lib/utils"
import type React from "react"
import { TbEqual } from "react-icons/tb"
import shared from "./shared"


const AbsIcon = (props: React.ComponentPropsWithoutRef<typeof TbEqual>) =>
    <TbEqual
        {...props}
        className={cn("rotate-90", props.className)}
    />

export default createClientNodeDefinition(shared, {
    icon: AbsIcon,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        absolute: {},
    },
})
