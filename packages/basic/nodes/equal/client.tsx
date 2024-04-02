import type { WebNodeDefinition } from "@types"
import { TbEqual } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbEqual,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        a: {},
        b: {},
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
