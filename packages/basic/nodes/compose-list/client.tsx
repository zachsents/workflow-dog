import { WebNodeDefinition } from "@types"
import { TbBracketsContain } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbBracketsContain,
    color: "#1f2937",
    tags: ["Basic"],
    inputs: {
        items: {}
    },
    outputs: {
        list: {}
    },
} satisfies WebNodeDefinition<typeof shared>
