import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Moderate with ChatGPT",
    description: "Use ChatGPT to moderate a message and check if it contains harmful content.",
    inputs: {
        message: {
            name: "Message",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        flagged: {
            name: "Flagged",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
        categories: {
            name: "Categories",
            type: "https://data-types.workflow.dog/openai/moderation-categories",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
