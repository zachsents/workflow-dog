import type { SharedNodeDefinition } from "@types"

export default {
    name: "Logarithm",
    description: "Calculates the logarithm of a number to a specified base.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
        base: {
            name: "Base",
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
