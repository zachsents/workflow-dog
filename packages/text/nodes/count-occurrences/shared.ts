import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Count Occurrences",
    description: "Counts the number of times some text or regex pattern appears in other text.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        search: {
            name: "Search",
            type: "https://data-types.workflow.dog/text/text-or-regex",
        },
    },
    outputs: {
        count: {
            name: "Count",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})