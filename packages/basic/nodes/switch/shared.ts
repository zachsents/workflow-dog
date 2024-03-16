import type { SharedNodeDefinition } from "@types"

export default {
    name: "Switch",
    description: "A simple on/off (true/false) value.",
    inputs: {},
    outputs: {
        enabled: {
            name: "Enabled",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    }
} satisfies SharedNodeDefinition
