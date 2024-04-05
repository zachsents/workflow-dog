import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Switch",
    description: "A simple on/off (true/false) value.",
    inputs: {},
    outputs: {
        enabled: {
            name: "Enabled",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    }
})
