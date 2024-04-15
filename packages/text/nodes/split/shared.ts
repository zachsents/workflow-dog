import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Split Text",
    description: "Splits text by a certain delimiter.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        delimiter: {
            name: "Split By",
            type: "https://data-types.workflow.dog/text/text-or-regex",
        },
    },
    outputs: {
        parts: {
            name: "Parts",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
        },
    },
})