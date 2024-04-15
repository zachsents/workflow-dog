import { createClientNodeDefinition } from "@pkg/types"
import { TbLayoutList } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLayoutList,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["join", "concatenate", "text", "string"],
    inputs: {
        pieces: {
            groupName: "Pieces",
        },
    },
    outputs: {
        combined: {},
    },
})
