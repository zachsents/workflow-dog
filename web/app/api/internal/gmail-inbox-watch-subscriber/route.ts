import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import axios from "axios"
import { google, type gmail_v1 } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import quotedPrintable from "quoted-printable"
import { z } from "zod"


export async function POST(req: NextRequest) {

    const bodyValidation = bodySchema.safeParse(await req.json())
    if (!bodyValidation.success)
        return errorResponse("Invalid request body", 400)

    const messageValidation = decodedMessageSchema.safeParse(
        JSON.parse(
            Buffer.from(bodyValidation.data.message.data, "base64url").toString()
        )
    )
    if (!messageValidation.success)
        return errorResponse("Invalid message data", 400)

    const { emailAddress } = messageValidation.data

    const supabase = await supabaseServerAdmin()

    const serviceAccountId = await supabase
        .from("integration_accounts")
        .select("id")
        .eq("service_id", "https://services.workflow.dog/google/google-oauth")
        .eq("profile->>email", emailAddress)
        .single()
        .throwOnError()
        .then(q => q.data?.id!)

    const token = await getServiceAccountToken(supabase, serviceAccountId) as { access_token: string } | null

    const workflows = await supabase
        .from("workflows")
        .select("id, startHistoryId:trigger->data->>historyId")
        .eq("trigger->>type", "https://triggers.workflow.dog/google/gmail-email-received")
        .eq("trigger->config->>googleAccount", serviceAccountId)
        .throwOnError()
        .then(q => q.data || [])

    const oldestHistoryId = workflows
        .map(w => parseInt(w.startHistoryId))
        .reduce((oldest, current) => oldest < current ? oldest : current)
        .toString()

    const gmail = google.gmail("v1")

    const { history, historyId: newHistoryId } = await gmail.users.history.list({
        userId: "me",
        startHistoryId: oldestHistoryId,
        historyTypes: ["messageAdded"],
        access_token: token?.access_token!,
    }).then(res => res.data)

    await Promise.all(workflows.map(w =>
        supabase
            .rpc("set_workflow_trigger_field", {
                _workflow_id: w.id,
                path: ["data", "historyId"],
                value: newHistoryId!,
            })
            .throwOnError()
    ))

    const filteredHistory = history?.flatMap(({ messagesAdded }) => {
        if (!messagesAdded)
            return []

        return messagesAdded
            .map(entry => entry.message)
            .filter(msg => msg?.id && msg.labelIds?.includes("INBOX")) as gmail_v1.Schema$Message[]
    }) ?? []

    const newMessageRequests = filteredHistory.map(async msg => {
        const res = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "full",
            access_token: token?.access_token!,
        })
        return parseMessage(res.data)
    })

    const newMessages = await Promise.all(newMessageRequests)

    const workflowExecutionRequests = workflows.flatMap(w => {
        const currentHistoryId = parseInt(w.startHistoryId)
        const relevantMessages = newMessages.filter(msg =>
            parseInt(msg.historyId!) >= currentHistoryId
            && msg.toAddress === emailAddress
        )
        return relevantMessages.map(async msg => {
            // console.debug([
            //     "Subject: " + msg.subject,
            //     `${msg.senderName} (${msg.senderAddress})`,
            //     `### PLAIN ###\n${msg.plain?.slice(0, 50).replaceAll(/[\r\n]/g, "") + "..."}`,
            //     `### HTML ###\n${msg.html?.slice(0, 50).replaceAll(/[\r\n]/g, "") + "..."}`,
            // ].join("\n"))
            // console.log()

            return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${w.id}/run`, {
                triggerData: msg,
            })
        })
    })

    await Promise.all(workflowExecutionRequests)

    return NextResponse.json({
        success: true,
    })
}


const bodySchema = z.object({
    message: z.object({
        data: z.string()
            .describe("This is the actual notification data, as base64url-encoded JSON."),
        messageId: z.string()
            .describe("This is a Cloud Pub/Sub message id, unrelated to Gmail messages."),
        publishTime: z.string()
            .datetime()
            .describe("This is the publish time of the message."),
    }),
    subscription: z.string(),
})

const decodedMessageSchema = z.object({
    emailAddress: z.string().email(),
    historyId: z.number(),
})


function parseMessage(message: gmail_v1.Schema$Message) {
    const parsedPayload = parseMessagePayload(message.payload)

    const fromHeader = getHeader(message.payload!, "From")
    const sender: any = fromHeader ? parsePerson(fromHeader) : {}

    return {
        historyId: message.historyId!,
        toAddress: parsePerson(getHeader(message.payload!, "To")!).email,

        id: message.id!,
        threadId: message.threadId!,
        labelIds: message.labelIds || [],
        date: new Date(parseInt(message.internalDate!)).toISOString(),
        ...parsedPayload,
        subject: getHeader(message.payload!, "Subject"),
        senderName: sender.name || null,
        senderAddress: sender.email || null,
    }
}


type ParsedMessage = {
    plain?: string,
    html?: string,
    attachments: {
        name: string,
        mimeType: string,
        data?: string,
        attachmentId?: string,
    }[],
}

function parseMessagePayload(payload: gmail_v1.Schema$MessagePart | undefined): ParsedMessage {
    if (payload?.mimeType?.startsWith("multipart/")) {
        return (payload.parts || []).reduce((acc, part) => {
            const { attachments, ...rest } = parseMessagePayload(part)
            return {
                ...acc,
                ...rest,
                attachments: [...acc.attachments, ...attachments],
            }
        }, { attachments: [] } as ParsedMessage)
    }

    const headers: Record<string, string> = Object.fromEntries(
        payload?.headers?.map(h => [h.name, h.value]) || []
    )

    if (payload?.mimeType?.startsWith("text/")) {
        let text = Buffer.from(payload.body?.data || "", "base64url")
            .toString()

        if (headers["Content-Transfer-Encoding"] === "quoted-printable")
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

function getHeader(payload: gmail_v1.Schema$MessagePart, name: string) {
    return payload.headers?.find(h => h.name === name)?.value
}

function parsePerson(person: string): { name?: string, email: string } {
    const fullRegex = /(.+?)<(.+?)>/
    if (fullRegex.test(person)) {
        const [, name, email] = person.match(fullRegex)!
        return { name: name.trim(), email: email.trim() }
    }

    return { email: person.trim() }
}

