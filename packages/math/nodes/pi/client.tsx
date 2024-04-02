import type { WebNodeDefinition } from "@types"
import type shared from "./shared"
import { TbMathPi } from "react-icons/tb"

export default {
    icon: TbMathPi,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {},
    outputs: {
        pi: {},
    },
} satisfies WebNodeDefinition<typeof shared>
