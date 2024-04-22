import { assertArgProvided } from "@pkg/_lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import { getAttachmentAsFile } from "@web/lib/server/gmail"
import { google } from "googleapis"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ attachmentRef }, { token }) => {
        assertArgProvided(attachmentRef, "attachment reference")

        const gmail = google.gmail({
            version: "v1",
            params: { access_token: token?.access_token },
        })

        const { messageId, ...attachment } = attachmentRef
        const file = await getAttachmentAsFile(gmail, { attachment, messageId })

        return { file }
    },
})
