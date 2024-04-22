import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Mark as Unread",
    description: "Marks an email message as unread.",
    inputs: {
        messageId: {
            name: "Message ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {},
    requiredService: {
        id: "https://services.workflow.dog/google/google-oauth",
        scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    },
})
