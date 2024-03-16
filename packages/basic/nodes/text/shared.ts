import type { SharedNodeDefinition } from "@types"

export default {
    name: "Text",
    description: "A simple text node",
    inputs: {},
    outputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    }
} satisfies SharedNodeDefinition
