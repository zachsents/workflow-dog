import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Convert to JSON Text",
    description: "Converts a data object into JSON text.",
    inputs: {
        object: {
            name: "Object",
            type: "https://data-types.workflow.dog/basic/object",
        },
    },
    outputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    }
})
