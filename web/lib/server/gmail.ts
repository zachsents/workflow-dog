import { type gmail_v1 } from "googleapis"
import quotedPrintable from "quoted-printable"


export type ParsedMessage = ReturnType<typeof parseMessage>

export function parseMessage(msg: gmail_v1.Schema$Message) {
    const fromHeader = getHeader(msg.payload!, "From")
    const sender = fromHeader
        ? parseContact(fromHeader)
        : undefined

    const toHeader = getHeader(msg.payload!, "To")
    const recipient = toHeader
        ? parseContact(toHeader)
        : undefined

    return {
        id: msg.id!,
        threadId: msg.threadId!,
        historyId: msg.historyId!,
        labelIds: msg.labelIds || [],
        headers: indexHeaders(msg.payload?.headers || []),

        recipientName: recipient?.name || null,
        recipientAddress: recipient?.email || null,
        senderName: sender?.name || null,
        senderAddress: sender?.email || null,

        subject: getHeader(msg.payload!, "Subject"),
        date: new Date(parseInt(msg.internalDate!)).toISOString(),

        ...msg.payload ? parseMessagePayload(msg.payload) : {},
    }
}


export type ParsedMessagePayload = {
    plain?: string,
    html?: string,
    attachments: {
        name: string,
        mimeType: string,
        data?: string,
        attachmentId?: string,
    }[],
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

    return {
        attachments: [
            {
                name: payload?.filename!,
                mimeType: payload?.mimeType!,
                attachmentId: payload?.body?.attachmentId!,
            }
        ]
    }
}


export function getHeader(payload: gmail_v1.Schema$MessagePart, name: string) {
    return payload.headers?.find(h => h.name === name)?.value
}


type ParsedContact = {
    name?: string,
    email: string,
}

export function parseContact(contact: string): ParsedContact {
    if (contact.includes("<") && contact.includes(">")) {
        const match = contact.match(/(.+?)?<(.+?)>/) || []
        return {
            name: match[1]?.trim(),
            email: match[2]?.trim(),
        }
    }

    return {
        email: contact.trim(),
    }
}


export function indexHeaders(headers: gmail_v1.Schema$MessagePartHeader[]): Record<string, string> {
    return Object.fromEntries(
        headers
            .filter(h => !!h.name && !!h.value)
            .map(h => [h.name!.toLowerCase(), h.value!])
    )
}