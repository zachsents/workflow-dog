import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "First Non-Null",
    description: "Falls back to the first non-null value.",
    inputs: {
        inputs: {
            name: "Input",
            type: "https://data-types.workflow.dog/basic/any",
            group: true,
        }
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/any",
        },
    }
})
