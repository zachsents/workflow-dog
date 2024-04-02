import type { SharedNodeDefinition } from "@types"

export default {
    name: "Cosine (cos)",
    description: "Calculates the cosine of a number.",
    inputs: {
        angle: {
            name: "Angle",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        cosine: {
            name: "Cosine",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition