import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Parse JSON",
    description: "Parses JSON text into a data object.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        object: {
            name: "Object",
            type: "https://data-types.workflow.dog/basic/object",
        },
    },
})
