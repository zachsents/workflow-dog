import { createExecutionNodeDefinition } from "@pkg/types"
import { google } from "googleapis"
import { createMimeMessage } from "mimetext"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ to, message, subject, attachments }, { token }) => {
        if (!to)
            throw new Error("No recipient provided")

        if (!message)
            throw new Error("No message provided")

        if (!subject)
            throw new Error("No subject provided")

        const senderAddress = await google.gmail("v1").users.getProfile({
            userId: "me",
            access_token: token?.access_token,
        }).then(res => res.data.emailAddress!)

        const msg = createMimeMessage()
        msg.setSender({ addr: senderAddress })
        msg.setRecipient(to)
        msg.setSubject(subject)

        msg.addMessage({
            contentType: "text/plain",
            data: message,
        })
        // html && msg.setMessage({
        //     contentType: "text/html",
        //     data: html,
        // })

        // msg.setHeader("Reply-To", senderAddress!)
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

        await google.gmail("v1").users.messages.send({
            access_token: token?.access_token,
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            }
        })

        return {}
    },
})
