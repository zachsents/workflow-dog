import type { SharedNodeDefinition } from "@types"

export default {
    name: "Pi (π)",
    description: "Outputs the mathematical constant PI.",
    inputs: {},
    outputs: {
        pi: {
            name: "π",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
