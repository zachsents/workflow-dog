
export default {
    name: "Prompt ChatGPT",
    description: "Sends a message to OpenAI's ChatGPT model.",

    inputs: {
        message: {
            name: "Message",
            type: "data-type:basic.string",
        }
    },
    outputs: {
        response: {
            name: "Response",
            type: "data-type:basic.string",
        }
    },

    requiredIntegration: {
        service: "openai",
    },
}