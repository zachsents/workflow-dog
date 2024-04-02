import type { WebNodeDefinition } from "@types"
import { TbLogicOr } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbLogicOr,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
