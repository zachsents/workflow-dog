import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "First Non-False",
    description: "Falls back to the first non-false value.",
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
