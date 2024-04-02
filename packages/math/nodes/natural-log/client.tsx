import type { WebNodeDefinition } from "@types"
import { TbMathSymbols } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbMathSymbols,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>

