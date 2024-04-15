import { createClientNodeDefinition } from "@pkg/types"
import { TbLetterCaseUpper } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLetterCaseUpper,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
    },
    outputs: {
        uppercase: {},
    },
})
