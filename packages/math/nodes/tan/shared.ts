import type { SharedNodeDefinition } from "@types"

export default {
    name: "Tangent (tan)",
    description: "Calculates the tangent of a number.",
    inputs: {
        angle: {
            name: "Angle",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        tangent: {
            name: "Tangent",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
