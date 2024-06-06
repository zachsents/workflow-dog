import { assertArgProvided } from "@pkg/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import { parseMessage } from "@web/lib/server/gmail"
import { google } from "googleapis"
import { createMessage } from "../lib/gmail"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ messageId, message, attachments }, { token }) => {
        assertArgProvided(messageId, "message ID")
        assertArgProvided(message, "message")

        const gmail = google.gmail({
            version: "v1",
            params: { access_token: token?.access_token },
        })

        const originalMessage = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
            format: "metadata",
        }).then(res => parseMessage(res.data))

        const encodedMessage = await createMessage(gmail, {
            to: {
                addr: originalMessage.senderAddress!,
                name: originalMessage.senderName!,
            },
            subject: originalMessage.subject!,
            message: { text: message },
            attachments,
            headers: {
                "In-Reply-To": originalMessage.headers["message-id"],
                "References": (originalMessage.headers["references"] || "")
                    + " "
                    + originalMessage.headers["message-id"]
            },
            mode: "encoded",
        }) as string

        await gmail.users.drafts.create({
            userId: "me",
            requestBody: {
                message: {
                    raw: encodedMessage,
                    threadId: originalMessage.threadId,
                }
            }
        })

        return {}
    },
})
