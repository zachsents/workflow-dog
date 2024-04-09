import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Prompt ChatGPT with Image",
    description: "Prompt ChatGPT with a message and an image.",
    inputs: {
        message: {
            name: "Message",
            type: "https://data-types.workflow.dog/basic/string",
        },
        image: {
            name: "Image",
            type: "https://data-types.workflow.dog/basic/file",
        },
        historyIn: {
            name: "History",
            type: "https://data-types.workflow.dog/openai/chat-history",
        },
    },
    outputs: {
        response: {
            name: "Response",
            type: "https://data-types.workflow.dog/basic/string",
        },
        historyOut: {
            name: "History",
            type: "https://data-types.workflow.dog/openai/chat-history",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
