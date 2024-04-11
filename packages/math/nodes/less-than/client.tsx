import { createClientNodeDefinition } from "@pkg/types"
import { TbMathLower } from "react-icons/tb"
import OrEqualOption from "../_components/or-equal-option"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathLower,
    color: "#4b5563",
    tags: ["Math", "Comparison"],
    inputs: {
        a: {},
        b: {},
    },
    outputs: {
        result: {},
    },
    renderBody: OrEqualOption,
})
