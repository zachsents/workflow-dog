import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Message by ID",
    description: "Gets a message from Gmail by its ID.",
    inputs: {
        messageId: {
            name: "Message ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        senderAddress: {
            name: "Sender Email Address",
            type: "https://data-types.workflow.dog/basic/string",
        },
        senderName: {
            name: "Sender Name",
            type: "https://data-types.workflow.dog/basic/string",
        },
        subject: {
            name: "Subject",
            type: "https://data-types.workflow.dog/basic/string",
        },
        date: {
            name: "Date",
            type: "https://data-types.workflow.dog/basic/datetime",
        },
        html: {
            name: "Body (HTML)",
            type: "https://data-types.workflow.dog/basic/string",
        },
        plain: {
            name: "Body (Plain Text)",
            type: "https://data-types.workflow.dog/basic/string",
        },
        attachmentRefs: {
            name: "Attachment References",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/google/google-oauth",
        scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    },
})
