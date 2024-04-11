import { createClientNodeDefinition } from "@pkg/types"
import { TbMathSymbols } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathSymbols,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        number: {},
        base: {
            description: "Base of the logarithm (default: e)",
        },
    },
    outputs: {
        result: {},
    },
})

