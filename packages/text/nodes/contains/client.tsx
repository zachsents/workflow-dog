import { createClientNodeDefinition } from "@pkg/types"
import { TbContainer } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbContainer,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
        search: {},
    },
    outputs: {
        contains: {},
    },
})
