import { createClientNodeDefinition } from "@pkg/types"
import { TbDivide } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbDivide,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        dividend: {},
        divisor: {},
    },
    outputs: {
        quotient: {},
        remainder: {},
    },
})
