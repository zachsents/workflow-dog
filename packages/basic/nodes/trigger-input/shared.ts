import type { SharedNodeDefinition } from "@types"

export default {
    name: "Use Data From Trigger",
    description: "Uses an input from the trigger.",
    inputs: {},
    outputs: {
        value: {
            name: "Value",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
} satisfies SharedNodeDefinition
