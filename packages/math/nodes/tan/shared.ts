import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
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
})
