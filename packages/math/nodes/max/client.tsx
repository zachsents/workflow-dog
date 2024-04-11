import { createClientNodeDefinition } from "@pkg/types"
import { TbMathMax } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathMax,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        numbers: {},
    },
    outputs: {
        max: {},
    },
})
