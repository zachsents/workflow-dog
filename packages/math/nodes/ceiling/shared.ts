import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Ceiling",
    description: "Rounds a number up to the nearest integer.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        ceiled: {
            name: "Ceiled Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    }
})
