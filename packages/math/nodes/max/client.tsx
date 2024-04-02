import type { WebNodeDefinition } from "@types"
import { TbMathMax } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbMathMax,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        numbers: {},
    },
    outputs: {
        max: {},
    },
} satisfies WebNodeDefinition<typeof shared>
