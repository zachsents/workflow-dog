import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Min",
    description: "Finds the minimum value from a group of numbers.",
    inputs: {
        numbers: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
            group: true,
            named: false,
        },
    },
    outputs: {
        min: {
            name: "Minimum",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
