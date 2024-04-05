import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Max",
    description: "Finds the maximum value from a group of numbers.",
    inputs: {
        numbers: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
            group: true,
            named: false,
        },
    },
    outputs: {
        max: {
            name: "Maximum",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
