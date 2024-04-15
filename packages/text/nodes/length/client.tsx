import { createClientNodeDefinition } from "@pkg/types"
import { TbRuler } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbRuler,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
    },
    outputs: {
        length: {},
    },
})
