import { createClientNodeDefinition } from "@pkg/types"
import { TbSlice } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbSlice,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
        delimiter: {},
    },
    outputs: {
        parts: {},
    },
})
