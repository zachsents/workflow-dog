import { createClientNodeDefinition } from "@pkg/types"
import { TbParachute } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbParachute,
    color: "#4b5563",
    tags: ["Control"],
    searchTerms: ["coalesce", "falsy", "fallback"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
})
