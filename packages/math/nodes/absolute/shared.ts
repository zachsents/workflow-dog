import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Absolute Value",
    description: "Calculates the absolute value of a number.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        absolute: {
            name: "Absolute Value",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
