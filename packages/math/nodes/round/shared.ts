import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Round",
    description: "Rounds a number to the nearest integer.",
    inputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        rounded: {
            name: "Rounded Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
