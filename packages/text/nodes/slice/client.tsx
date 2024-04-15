import { createClientNodeDefinition } from "@pkg/types"
import { TbScissors } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbScissors,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {
        text: {},
        start: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/number",
                handle: "number",
            },
        },
        end: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/number",
                handle: "number",
            },
        },
    },
    outputs: {
        slice: {},
    },
})
