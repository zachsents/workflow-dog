import type { SharedNodeDefinition } from "@types"

export default {
    name: "Unpack Object",
    description: "Decomposes an object into its properties.",
    inputs: {
        object: {
            name: "Object",
            type: "https://data-types.workflow.dog/basic/object",
        },
    },
    outputs: {
        properties: {
            name: "Properties",
            type: "https://data-types.workflow.dog/basic/any",
            group: true,
            named: true,
        },
    }
} satisfies SharedNodeDefinition
