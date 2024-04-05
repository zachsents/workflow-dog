import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "And",
    description: "Logical AND operator",
    inputs: {
        inputs: {
            name: "Input",
            type: "https://data-types.workflow.dog/basic/boolean",
            group: true,
            named: false,
        }
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    }
})
