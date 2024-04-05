import { createClientNodeDefinition } from "@pkg/types"
import { TbMathMin } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathMin,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        numbers: {},
    },
    outputs: {
        min: {},
    },
})
