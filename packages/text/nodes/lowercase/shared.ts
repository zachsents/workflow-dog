import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Lowercase",
    description: "Converts text to lowercase.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        lowercase: {
            name: "Lowercase",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})