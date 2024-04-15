import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Convert to Regex",
    description: "Creates a regex from text.",
    inputs: {
        pattern: {
            name: "Pattern",
            type: "https://data-types.workflow.dog/basic/string",
        },
        flags: {
            name: "Flags",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        regex: {
            name: "Regex",
            type: "https://data-types.workflow.dog/text/regex",
        },
    },
})