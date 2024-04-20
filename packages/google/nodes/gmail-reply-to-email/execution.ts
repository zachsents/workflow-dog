import { createExecutionNodeDefinition } from "@pkg/types"
import { google } from "googleapis"
import { createMimeMessage } from "mimetext"
import shared from "./shared"
import { parseMessage } from "@web/lib/server/gmail"


export default createExecutionNodeDefinition(shared, {
    action: async ({ messageId, message, attachments }, { token }) => {
        if (!messageId)
            throw new Error("No message ID provided")

        if (!message)
            throw new Error("No message provided")

        const gmail = google.gmail("v1")

        const [senderAddress, originalMessage] = await Promise.all([
            gmail.users.getProfile({
                userId: "me",
                access_token: token?.access_token,
            }).then(res => res.data.emailAddress),

            gmail.users.messages.get({
                userId: "me",
                access_token: token?.access_token,
                id: messageId,
                format: "metadata",
            }).then(res => parseMessage(res.data)),
        ])

        const msg = createMimeMessage()
        msg.setSender(senderAddress!)
        msg.setRecipient({
            addr: originalMessage.senderAddress!,
            name: originalMessage.senderName!,
        })
        msg.setSubject(originalMessage.subject!)

        msg.addMessage({
            contentType: "text/plain",
            data: message,
        })
        // html && msg.setMessage({
        //     contentType: "text/html",
        //     data: html,
        // })

        msg.setHeader("In-Reply-To", originalMessage.headers["message-id"])
        msg.setHeader(
            "References",
            (originalMessage.headers["references"] || "") + " " + originalMessage.headers["message-id"]
        )
        msg.setHeader("X-Triggered-By", "WorkflowDog")

        attachments.forEach(attachment => {
            msg.addAttachment({
                filename: attachment.name,
                contentType: attachment.mimeType,
                data: attachment.data,
                encoding: "base64",
            })
        })

        const encodedMessage = Buffer.from(msg.asRaw()).toString("base64url")

        await gmail.users.messages.send({
            access_token: token?.access_token,
            userId: "me",
            requestBody: {
                raw: encodedMessage,
                threadId: originalMessage.threadId,
            },
        })

        return {}
    },
})
