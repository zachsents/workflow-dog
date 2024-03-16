import type { SharedNodeDefinition } from "@types"

export default {
    name: "Number",
    description: "A simple number node",
    inputs: {},
    outputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    }
} satisfies SharedNodeDefinition
