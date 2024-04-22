import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Attachment",
    description: "Gets an attachment from an attachment reference.",
    inputs: {
        attachmentRef: {
            name: "Attachment Reference",
            type: "https://data-types.workflow.dog/google/attachment-ref",
        },
    },
    outputs: {
        file: {
            name: "File",
            type: "https://data-types.workflow.dog/basic/file",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/google/google-oauth",
        scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    },
})
