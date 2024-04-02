import type { SharedNodeDefinition } from "@types"

export default {
    name: "Send Email",
    description: "Send an email from your Gmail account.",
    inputs: {
        to: {
            name: "To",
            type: "https://data-types.workflow.dog/basic/string",
        },
        subject: {
            name: "Subject",
            type: "https://data-types.workflow.dog/basic/string",
        },
        message: {
            name: "Message",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {},
    requiredService: {
        id: "https://services.workflow.dog/google/google-oauth",
        scopes: ["https://www.googleapis.com/auth/gmail.send"],
    },
} satisfies SharedNodeDefinition
