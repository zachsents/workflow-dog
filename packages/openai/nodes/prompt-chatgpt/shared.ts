import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Prompt ChatGPT",
    description: "Prompt ChatGPT with a message.",
    inputs: {
        message: {
            name: "Message",
            type: "https://data-types.workflow.dog/basic/string",
        },
        historyIn: {
            name: "History",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    outputs: {
        response: {
            name: "Response",
            type: "https://data-types.workflow.dog/basic/string",
        },
        historyOut: {
            name: "History",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
