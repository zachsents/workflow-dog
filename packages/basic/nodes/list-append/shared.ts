import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Append to List",
    description: "Appends items to a list.",
    inputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
        items: {
            name: "Item",
            type: "https://data-types.workflow.dog/basic/any",
            group: true,
        },
    },
    outputs: {
        newList: {
            name: "New List",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
})
