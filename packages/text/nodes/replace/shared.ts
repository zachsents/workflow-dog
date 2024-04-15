import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Text Replace",
    description: "Replaces text with other text.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        search: {
            name: "Search",
            type: "https://data-types.workflow.dog/text/text-or-regex",
            group: true,
        },
        replace: {
            name: "Replace",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
        },
    },
    outputs: {
        replaced: {
            name: "Replaced",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})