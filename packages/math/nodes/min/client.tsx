import { createClientNodeDefinition } from "@pkg/types"
import { TbMathMin } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathMin,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        numbers: {},
    },
    outputs: {
        min: {},
    },
})
