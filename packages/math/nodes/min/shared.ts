import type { SharedNodeDefinition } from "@types"

export default {
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
} satisfies SharedNodeDefinition
