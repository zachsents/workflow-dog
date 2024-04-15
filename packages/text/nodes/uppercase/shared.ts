import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Uppercase",
    description: "Converts text to uppercase.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        uppercase: {
            name: "Uppercase",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})