import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Draft Message",
    description: "Create a draft email message.",
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
