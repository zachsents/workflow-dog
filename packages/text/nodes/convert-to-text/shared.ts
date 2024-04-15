import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Convert to Text",
    description: "Converts a value to text.",
    inputs: {
        value: {
            name: "Value",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
    outputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})