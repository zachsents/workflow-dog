import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Use Data From Trigger",
    description: "Uses an input from the trigger.",
    inputs: {},
    outputs: {
        value: {
            name: "Value",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
})
