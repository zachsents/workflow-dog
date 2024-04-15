import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Regex Search",
    description: "Searches through text with a regular expression.",
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
        match: {
            name: "Match",
            type: "https://data-types.workflow.dog/basic/string",
        },
        matchedGroups: {
            name: "Matched Groups",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
        },
    },
})