import type { WebNodeDefinition } from "@types"
import { TbEqualNot } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbEqualNot,
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
