import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Reply to Email",
    description: "Reply to an email in your Gmail account.",
    inputs: {
        messageId: {
            name: "Message ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
        message: {
            name: "Message",
            type: "https://data-types.workflow.dog/basic/string",
        },
        attachments: {
            name: "Attachment",
            type: "https://data-types.workflow.dog/basic/file",
            group: true,
        },
    },
    outputs: {},
    requiredService: {
        id: "https://services.workflow.dog/google/google-oauth",
        scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    },
})
