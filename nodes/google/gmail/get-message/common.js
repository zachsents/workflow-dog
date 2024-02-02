
export default {
    name: "Get Message",
    description: "Get a message from a Gmail account.",

    inputs: {
        messageId: {
            name: "Message ID",
            type: "data-type:basic.string",
        }
    },
    outputs: {},

    requiredIntegration: {
        service: "google",
        scopes: [
            ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail"]
        ],
    },
}