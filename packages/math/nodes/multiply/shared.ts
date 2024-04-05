import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Multiply",
    description: "Multiplies a variable number of inputs.",
    inputs: {
        factors: {
            name: "Input",
            type: "https://data-types.workflow.dog/basic/number",
            group: true,
            named: false,
        },
    },
    outputs: {
        product: {
            name: "Product",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
