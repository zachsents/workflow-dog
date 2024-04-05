import { createClientNodeDefinition } from "@pkg/types"
import { TbMathSymbols } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathSymbols,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        result: {},
    },
})

