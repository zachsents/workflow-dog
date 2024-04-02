import { TbArrowsRightLeft } from "react-icons/tb"
import type { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbArrowsRightLeft,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        rounded: {},
    },
} satisfies WebNodeDefinition<typeof shared>
