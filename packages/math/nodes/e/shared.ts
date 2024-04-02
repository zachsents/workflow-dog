import type { SharedNodeDefinition } from "@types"

export default {
    name: "E (e)",
    description: "Outputs the mathematical constant e.",
    inputs: {},
    outputs: {
        e: {
            name: "e",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
} satisfies SharedNodeDefinition
