import type { SharedNodeDefinition } from "@types"

export default {
    name: "Add",
    description: "Adds a variable number of inputs.",
    inputs: {
        addends: {
            name: "Input",
            type: "https://data-types.workflow.dog/basic/number",
            group: true,
            named: false,
        },
    },
    outputs: {
        sum: {
            name: "Sum",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} as SharedNodeDefinition