import { WebNodeDefinition } from "@types"
import { TbDivide } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbDivide,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        dividend: {},
        divisor: {},
    },
    outputs: {
        quotient: {},
        remainder: {},
    },
} satisfies WebNodeDefinition<typeof shared>
