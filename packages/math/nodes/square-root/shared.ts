import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
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
})
