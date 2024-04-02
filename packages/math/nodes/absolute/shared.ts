import type { SharedNodeDefinition } from "@types"

export default {
    name: "Absolute Value",
    description: "Calculates the absolute value of a number.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        absolute: {
            name: "Absolute Value",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
