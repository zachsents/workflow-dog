import type { SharedNodeDefinition } from "@types"

export default {
    name: "Prompt ChatGPT",
    description: "Prompt ChatGPT with a message.",
    inputs: {
        message: {
            name: "Message",
            type: "https://data-types.workflow.dog/basic/string",
        }
    },
    outputs: {
        response: {
            name: "Response",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
} satisfies SharedNodeDefinition
