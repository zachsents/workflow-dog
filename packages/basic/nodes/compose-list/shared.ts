import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Build List",
    description: "Composes a list from its items.",
    inputs: {
        items: {
            name: "Item",
            type: "https://data-types.workflow.dog/basic/any",
            group: true,
        },
    },
    outputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
})
