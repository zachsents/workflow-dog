import type { WebNodeDefinition } from "@types"
import { TbLogicXor } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbLogicXor,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
