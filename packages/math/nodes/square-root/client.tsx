import type { WebNodeDefinition } from "@types"
import { TbSquareRoot } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbSquareRoot,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        sqrt: {},
    },
} satisfies WebNodeDefinition<typeof shared>
