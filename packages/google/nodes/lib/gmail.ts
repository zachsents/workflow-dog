import { fileSchema } from "@pkg/basic/schemas"
import { type gmail_v1 } from "googleapis"
import { MIMEMessage, createMimeMessage } from "mimetext"
import { type z } from "zod"


interface CreateMessageOptions {
    to: Parameters<MIMEMessage["setRecipient"]>[0]
    subject: string
    message: {
        text: string
        html?: string
    }
    attachments?: z.infer<typeof fileSchema>[]
    headers?: Record<string, string>
    mode: "raw" | "encoded" | "class"
}

export async function createMessage(gmail: gmail_v1.Gmail, {
    to,
    subject,
    message,
    attachments,
    mode,
    headers,
}: CreateMessageOptions) {

    const senderAddress = await gmail.users.getProfile({
        userId: "me",
    }).then(res => res.data.emailAddress!)

    const msg = createMimeMessage()
    msg.setSender({ addr: senderAddress })
    msg.setRecipient(to)
    msg.setSubject(subject)

    msg.addMessage({
        contentType: "text/plain",
        data: message.text,
    })
    if (message.html) {
        msg.addMessage({
            contentType: "text/html",
            data: message.html,
        })
    }

    Object.entries(headers || {}).forEach(([key, value]) => {
        msg.setHeader(key, value)
    })
    msg.setHeader("X-Triggered-By", "WorkflowDog")

    attachments?.forEach(attachment => {
        msg.addAttachment({
            filename: attachment.name,
            contentType: attachment.mimeType,
            data: attachment.data,
            encoding: "base64",
        })
    })

    switch (mode) {
        case "class": return msg
        case "raw": return msg.asRaw()
        case "encoded": return Buffer.from(msg.asRaw()).toString("base64url")
    }
}