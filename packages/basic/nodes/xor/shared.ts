import type { SharedNodeDefinition } from "@types"

export default {
    name: "XOR",
    description: "Logical XOR operator",
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
} satisfies SharedNodeDefinition
