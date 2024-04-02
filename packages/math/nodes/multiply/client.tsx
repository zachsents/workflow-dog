import { TbX } from "react-icons/tb"
import type { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbX,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        factors: {},
    },
    outputs: {
        product: {},
    },
} satisfies WebNodeDefinition<typeof shared>
