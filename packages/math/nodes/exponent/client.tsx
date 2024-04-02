import { WebNodeDefinition } from "@types"
import { TbSuperscript } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbSuperscript,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        base: {},
        exponent: {},
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
