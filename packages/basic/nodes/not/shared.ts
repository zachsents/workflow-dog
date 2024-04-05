import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Not",
    description: "Negate a value",
    inputs: {
        input: {
            name: "Input",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    }
})
