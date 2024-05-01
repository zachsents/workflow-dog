import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Set Project Variable",
    description: "Set a project variable",
    inputs: {
        value: {
            name: "Value",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
    outputs: {
    }
})
