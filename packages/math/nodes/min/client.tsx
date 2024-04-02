import type { WebNodeDefinition } from "@types"
import { TbMathMin } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbMathMin,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        numbers: {},
    },
    outputs: {
        min: {},
    },
} satisfies WebNodeDefinition<typeof shared>
