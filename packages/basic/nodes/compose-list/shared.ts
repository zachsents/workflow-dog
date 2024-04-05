import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Build List",
    description: "Composes a list from its items.",
    inputs: {
        items: {
            name: "Items",
            type: "https://data-types.workflow.dog/basic/any",
            group: true,
            named: false,
        },
    },
    outputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
})
