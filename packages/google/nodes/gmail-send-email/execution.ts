import type { ExecutionNodeDefinition } from "@types"
import { google } from "googleapis"
import { createMimeMessage } from "mimetext"
import type shared from "./shared.js"


export default {
    action: async ({ to, message, subject }, { token }) => {
        if (!to)
            throw new Error("No recipient provided")

        if (!message)
            throw new Error("No message provided")

        if (!subject)
            throw new Error("No subject provided")

        // set up message
        const msg = createMimeMessage()
        // msg.setSender(senderEmailAddress)
        msg.setRecipient(to)
        msg.setSubject(subject)

        // add content
        msg.addMessage({
            contentType: "text/plain",
            data: message,
        })
        // html && msg.setMessage({
        //     contentType: "text/html",
        //     data: html,
        // })

        // add headers
        msg.setHeader("X-Triggered-By", "WorkflowDog")
        // headers.forEach(([name, value]) => msg.setHeader(name, value))

        // add attachments
        // attachments.forEach(attachment => {
        //     msg.addAttachment(attachment)
        // })

        // encode message
        const encodedMessage = Buffer.from(msg.asRaw()).toString("base64url")

        await google.gmail("v1").users.messages.send({
            access_token: token.access_token,
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            }
        })

        return {}
    },
} satisfies ExecutionNodeDefinition<typeof shared>
