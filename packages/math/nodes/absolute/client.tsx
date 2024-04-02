import type { WebNodeDefinition } from "@types"
import { cn } from "@web/lib/utils"
import type React from "react"
import { TbEqual } from "react-icons/tb"
import shared from "./shared"


const AbsIcon = (props: React.ComponentPropsWithoutRef<typeof TbEqual>) =>
    <TbEqual
        {...props}
        className={cn("rotate-90", props.className)}
    />

export default {
    icon: AbsIcon,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        absolute: {},
    },
} satisfies WebNodeDefinition<typeof shared>
