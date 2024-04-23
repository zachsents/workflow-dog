import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Last Item in List",
    description: "Gets the last item in a list.",
    inputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    outputs: {
        item: {
            name: "Item",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
})
