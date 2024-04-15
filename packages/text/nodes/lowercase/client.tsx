import { createClientNodeDefinition } from "@pkg/types"
import { TbLetterCaseLower } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLetterCaseLower,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
    },
    outputs: {
        lowercase: {},
    },
})
