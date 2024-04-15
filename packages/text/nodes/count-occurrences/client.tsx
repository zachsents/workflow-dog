import { createClientNodeDefinition } from "@pkg/types"
import { TbSearch } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbSearch,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
        search: {},
    },
    outputs: {
        count: {},
    },
})
