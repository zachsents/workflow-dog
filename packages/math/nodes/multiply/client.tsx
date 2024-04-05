import { TbX } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbX,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        factors: {},
    },
    outputs: {
        product: {},
    },
})
