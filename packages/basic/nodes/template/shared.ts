import type { SharedNodeDefinition } from "@types"

export default {
    name: "Template Text",
    description: "Fill in a template string with variables.",
    inputs: {
        template: {
            name: "Template",
            type: "https://data-types.workflow.dog/basic/string",
        },
        substitutions: {
            name: "Substitutions",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
            named: true,
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
} satisfies SharedNodeDefinition
