import { createClientNodeDefinition } from "@pkg/types"
import { TbTestPipe } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbTestPipe,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
        regex: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/text/regex",
                handle: "regex",
            },
        },
    },
    outputs: {
        result: {},
    },
})
