import { assertArgProvided } from "@pkg/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import { parseMessage } from "@web/lib/server/gmail"
import { google } from "googleapis"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ messageId }, { token }) => {
        assertArgProvided(messageId, "message ID")

        const gmail = google.gmail({
            version: "v1",
            params: { access_token: token?.access_token },
        })

        const message = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
            format: "full",
        }).then(res => parseMessage(res.data))

        return {
            senderAddress: message.senderAddress!,
            senderName: message.senderName!,
            subject: message.subject!,
            date: message.date!,
            html: (message.html || null)!,
            plain: (message.plain || null)!,
            attachmentRefs: message.attachmentRefs,
        }
    },
})
