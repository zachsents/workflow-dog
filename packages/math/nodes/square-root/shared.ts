import type { SharedNodeDefinition } from "@types"

export default {
    name: "Square Root",
    description: "Calculates the square root of a number.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        sqrt: {
            name: "Square Root",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
