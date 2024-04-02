import type { SharedNodeDefinition } from "@types"

export default {
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
} satisfies SharedNodeDefinition
