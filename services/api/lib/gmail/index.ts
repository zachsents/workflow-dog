// import type { fileSchema } from "@pkg/basic/schemas"
import { parseAddressList, type ParsedMailbox } from "email-addresses"
import quotedPrintable from "quoted-printable"
import type { gmail_v1 } from "./types"


export type ParsedMessage = ReturnType<typeof parseMessage>

export function parseMessage(msg: gmail_v1.Schema$Message) {
    const headers = indexHeaders(msg.payload?.headers || [])

    const {
        names: senderName,
        addresses: senderAddress,
    } = unzipMailboxesFromHeader(headers["from"])

    const {
        names: recipientName,
        addresses: recipientAddress,
    } = unzipMailboxesFromHeader(headers["to"])

    const { attachments, ...parsedPayload } = msg.payload
        ? parseMessagePayload(msg.payload)
        : { attachments: [] }

    const attachmentRefs = attachments?.map(a => ({
        messageId: msg.id!,
        ...a,
    })) ?? []

    return {
        id: msg.id!,
        threadId: msg.threadId!,
        historyId: msg.historyId!,
        labelIds: msg.labelIds || [],
        headers,

        recipientName,
        recipientAddress,
        senderName,
        senderAddress,

        subject: headers["subject"],
        date: new Date(parseInt(msg.internalDate!)).toISOString(),

        ...parsedPayload,
        attachmentRefs,
    }
}

type AttachmentReference = {
    name: string,
    mimeType: string,
    attachmentId: string,
}

export type ParsedMessagePayload = {
    plain?: string,
    html?: string,
    attachments: AttachmentReference[],
}

export function parseMessagePayload(payload: gmail_v1.Schema$MessagePart | undefined): ParsedMessagePayload {
    if (payload?.mimeType?.startsWith("multipart/")) {
        return (payload.parts || []).reduce((acc, part) => {
            const { attachments, ...rest } = parseMessagePayload(part)
            return {
                ...acc,
                ...rest,
                attachments: [...acc.attachments, ...attachments],
            }
        }, { attachments: [] } as ParsedMessagePayload)
    }

    const headers = indexHeaders(payload?.headers || [])

    if (payload?.mimeType?.startsWith("text/")) {
        let text = Buffer.from(payload.body?.data || "", "base64url")
            .toString()

        if (headers["content-transfer-encoding"] === "quoted-printable")
            text = quotedPrintable.decode(text)
                .replaceAll("\u0000", "")

        return {
            [payload.mimeType.split("/")[1]]: text,
            attachments: [],
        }
    }

    if (payload?.body?.attachmentId) {
        return {
            attachments: [{
                name: payload?.filename!,
                mimeType: payload?.mimeType!,
                attachmentId: payload?.body?.attachmentId!,
            }]
        }
    }

    return { attachments: [] }
}


export function getHeader(payload: gmail_v1.Schema$MessagePart, name: string) {
    return payload.headers?.find(h => h.name === name)?.value
}


type ParsedContact = {
    name?: string,
    email: string,
}


export function indexHeaders(headers: gmail_v1.Schema$MessagePartHeader[]): Record<string, string> {
    return Object.fromEntries(
        headers
            .filter(h => !!h.name && !!h.value)
            .map(h => [h.name!.toLowerCase(), h.value!])
    )
}


export function unzipMailboxesFromHeader(header: string | null | undefined): {
    names: string[]
    addresses: string[]
} {
    if (!header) return { names: [], addresses: [] }

    const mailboxes = (parseAddressList(header)
        ?.filter(item => !!item.name && item.type === "mailbox") ?? []) as ParsedMailbox[]

    return {
        names: mailboxes.map(m => m.name!),
        addresses: mailboxes.map(m => m.address),
    }
}


// export async function getAttachmentAsFile(gmail: gmail_v1.Gmail, {
//     messageId,
//     attachment,
// }: {
//     messageId: string
//     attachment: AttachmentReference
// }): Promise<z.infer<typeof fileSchema>> {
//     const base64urlData = await gmail.users.messages.attachments.get({
//         userId: "me",
//         messageId,
//         id: attachment.attachmentId,
//     }).then(res => res.data.data!)

//     return {
//         name: attachment.name,
//         mimeType: attachment.mimeType,
//         data: Buffer.from(base64urlData, "base64url").toString("base64"),
//     }
// }
