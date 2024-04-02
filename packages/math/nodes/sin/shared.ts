import type { SharedNodeDefinition } from "@types"

export default {
    name: "Sine (sin)",
    description: "Calculates the sine of a number.",
    inputs: {
        angle: {
            name: "Angle",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        sine: {
            name: "Sine",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
