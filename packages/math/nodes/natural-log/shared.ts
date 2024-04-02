import type { SharedNodeDefinition } from "@types"

export default {
    name: "Natural Log",
    description: "Calculates the natural logarithm (base e) of a number.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition