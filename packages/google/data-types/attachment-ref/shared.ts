import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "Attachment Reference",
    description: "A reference to a message attachment. Use the Get Attachment node to download the attachment.",
    schema: z.object({
        name: z.string(),
        mimeType: z.string(),
        messageId: z.string(),
        attachmentId: z.string(),
    }).passthrough(),
})