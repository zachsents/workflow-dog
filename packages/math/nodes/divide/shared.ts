import type { SharedNodeDefinition } from "@types"

export default {
    name: "Divide",
    description: "Divides the first input by the second input.",
    inputs: {
        dividend: {
            name: "Dividend",
            type: "https://data-types.workflow.dog/basic/number",
        },
        divisor: {
            name: "Divisor",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        quotient: {
            name: "Quotient",
            type: "https://data-types.workflow.dog/basic/number",
        },
        remainder: {
            name: "Remainder",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition