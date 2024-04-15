import { createClientNodeDefinition } from "@pkg/types"
import { TbArrowsExchange } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbArrowsExchange,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        value: {},
    },
    outputs: {
        text: {},
    },
})
