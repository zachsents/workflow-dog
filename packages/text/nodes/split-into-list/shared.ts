import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Split Text Into List",
    description: "Splits text by a certain delimiter. Outputs a list.",
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
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
})