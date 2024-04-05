import { createClientNodeDefinition } from "@pkg/types"
import { TbSquareRoot } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbSquareRoot,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        sqrt: {},
    },
})
