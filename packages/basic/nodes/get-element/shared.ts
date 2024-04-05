import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Element in List",
    description: "Get an element from a list by its index.",
    inputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
        index: {
            name: "Index",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        item: {
            name: "Item",
            type: "https://data-types.workflow.dog/basic/any",
        },
    }
})
