import type { SharedNodeDefinition } from "@types"

export default {
    name: "Sum",
    description: "Sums all elements of an array.",
    inputs: {
        array: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    outputs: {
        sum: {
            name: "Sum",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
