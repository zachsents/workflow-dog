import { createClientNodeDefinition } from "@pkg/types"
import { TbMathMax } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathMax,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        numbers: {},
    },
    outputs: {
        max: {},
    },
})
