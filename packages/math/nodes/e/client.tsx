import { TbCircleLetterE } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbCircleLetterE,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {},
    outputs: {
        e: {},
    },
} satisfies WebNodeDefinition<typeof shared>
