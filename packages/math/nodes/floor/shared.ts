import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Floor",
    description: "Rounds a number down to the nearest integer.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        floored: {
            name: "Floored Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
