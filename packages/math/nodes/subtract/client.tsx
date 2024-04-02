import { TbMinus } from "react-icons/tb"
import type { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbMinus,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        minuend: {
            description: "The number from which another number is to be subtracted.",
        },
        subtrahend: {
            description: "The number that is to be subtracted from the other number.",
        },
    },
    outputs: {
        difference: {
            description: "The result of the subtraction.",
        },
    },
} satisfies WebNodeDefinition<typeof shared>
