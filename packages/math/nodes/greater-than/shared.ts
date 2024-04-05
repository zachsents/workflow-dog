import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Greater Than",
    description: "Checks if the first input is greater than the second input.",
    inputs: {
        a: {
            name: "A",
            type: "https://data-types.workflow.dog/basic/number",
        },
        b: {
            name: "B",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    },
})
