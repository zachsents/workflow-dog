import { createClientNodeDefinition } from "@pkg/types"
import { TbReplace } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbReplace,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
        search: {},
        replace: {},
    },
    outputs: {
        replaced: {},
    },
})
