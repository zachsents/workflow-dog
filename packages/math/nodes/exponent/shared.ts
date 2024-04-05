import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Exponent",
    description: "Raises a number to the power of an exponent.",
    inputs: {
        base: {
            name: "Base",
            type: "https://data-types.workflow.dog/basic/number",
        },
        exponent: {
            name: "Exponent",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
