import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Subtract",
    description: "Subtracts the second input from the first.",
    inputs: {
        minuend: {
            name: "A",
            type: "https://data-types.workflow.dog/basic/number",
        },
        subtrahend: {
            name: "B",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        difference: {
            name: "Difference",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
