import type { SharedNodeDefinition } from "@types"

export default {
    name: "Pack Object",
    description: "Composes an object from its properties.",
    inputs: {
        properties: {
            name: "Properties",
            type: "https://data-types.workflow.dog/basic/any",
            group: true,
            named: true,
        },
    },
    outputs: {
        object: {
            name: "Object",
            type: "https://data-types.workflow.dog/basic/object",
        },
    },
} satisfies SharedNodeDefinition
