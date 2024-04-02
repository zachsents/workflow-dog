import { TbArrowDownCircle } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbArrowDownCircle,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        floored: {},
    },
} satisfies WebNodeDefinition<typeof shared>
