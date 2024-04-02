import type { SharedNodeDefinition } from "@types"

export default {
    name: "Not Equal",
    description: "Compare values",
    inputs: {
        a: {
            name: "A",
            type: "https://data-types.workflow.dog/basic/any",
        },
        b: {
            name: "B",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    }
} satisfies SharedNodeDefinition
