import type { SharedNodeDefinition } from "@types"

export default {
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
} satisfies SharedNodeDefinition
