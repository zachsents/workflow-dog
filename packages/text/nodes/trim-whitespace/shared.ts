import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Trim Whitespace",
    description: "Trims the whitespace (spaces, tabs, etc.) from text.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        trimmed: {
            name: "Trimmed",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})