import type { WebNodeDefinition } from "@types"
import { TbLineDashed } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbLineDashed,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        list: {},
        index: {},
    },
    outputs: {
        item: {},
    },
} satisfies WebNodeDefinition<typeof shared>
