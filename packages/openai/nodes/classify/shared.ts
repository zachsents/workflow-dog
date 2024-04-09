import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Classify with ChatGPT",
    description: "Classifies some prompt as one of several categories using ChatGPT.",
    inputs: {
        prompt: {
            name: "Prompt",
            type: "https://data-types.workflow.dog/basic/string",
        },
        categories: {
            name: "Category",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
            named: false,
        },
    },
    outputs: {
        category: {
            name: "Category",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
