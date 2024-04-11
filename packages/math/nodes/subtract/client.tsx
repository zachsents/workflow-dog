import { TbMinus } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMinus,
    color: "#4b5563",
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
})
