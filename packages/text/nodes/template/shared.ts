import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
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
})
