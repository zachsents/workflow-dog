import type { WebNodeDefinition } from "@types"
import { TbExclamationMark } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbExclamationMark,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        input: {},
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
