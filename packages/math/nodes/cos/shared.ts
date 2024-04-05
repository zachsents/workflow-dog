import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
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
})