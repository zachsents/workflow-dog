import { TbSum } from "react-icons/tb"
import type { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbSum,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        array: {},
    },
    outputs: {
        sum: {},
    },
} satisfies WebNodeDefinition<typeof shared>
