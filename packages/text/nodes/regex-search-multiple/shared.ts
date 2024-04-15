import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Regex Search Multiple",
    description: "Searches through text with a regular expression. Uses global flag to find all matches.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        search: {
            name: "Search",
            type: "https://data-types.workflow.dog/text/regex",
        },
    },
    outputs: {
        matches: {
            name: "Matches",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
})