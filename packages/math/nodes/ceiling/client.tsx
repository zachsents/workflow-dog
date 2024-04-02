import { TbArrowUpCircle } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbArrowUpCircle,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {}
    },
    outputs: {
        ceiled: {},
    },
} satisfies WebNodeDefinition<typeof shared>
