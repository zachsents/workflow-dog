import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Text Contains",
    description: "Checks if text contains a certain substring.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        search: {
            name: "Search",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        contains: {
            name: "Contains",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    },
})