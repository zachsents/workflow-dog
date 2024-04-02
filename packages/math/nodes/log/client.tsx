import type { WebNodeDefinition } from "@types"
import { TbMathSymbols } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbMathSymbols,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
        base: {
            description: "Base of the logarithm (default: e)",
        },
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>

