import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Project Variable",
    description: "Get a project variable",
    inputs: {},
    outputs: {
        value: {
            name: "Value",
            type: "https://data-types.workflow.dog/basic/any",
        },
    }
})
