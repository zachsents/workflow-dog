import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Regex",
    description: "This is where you can write your own regex.",
    inputs: {},
    outputs: {
        regex: {
            name: "Regex",
            type: "https://data-types.workflow.dog/text/regex",
        },
    },
})