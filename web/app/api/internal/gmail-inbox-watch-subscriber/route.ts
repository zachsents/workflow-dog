import { getAttachmentAsFile, parseMessage } from "@web/lib/server/gmail"
import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import axios from "axios"
import { google, type gmail_v1 } from "googleapis"
import _ from "lodash"
import { NextRequest, NextResponse } from "next/server"
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

    const gmail = google.gmail({
        version: "v1",
        params: { access_token: token?.access_token! },
    })

    const { history, historyId: newHistoryId } = await gmail.users.history.list({
        userId: "me",
        startHistoryId: oldestHistoryId,
        historyTypes: ["messageAdded"],
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
        const parsedMessage = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "full",
        }).then(res => parseMessage(res.data))

        const attachmentRefs = parsedMessage.attachments?.map(a => ({
            messageId: msg.id!,
            ...a,
        })) ?? []

        return {
            ..._.omit(parsedMessage, "attachments"),
            attachmentRefs,
        }
    })

    const newMessages = await Promise.all(newMessageRequests)

    const workflowExecutionRequests = workflows.flatMap(w => {
        const currentHistoryId = parseInt(w.startHistoryId)
        const relevantMessages = newMessages.filter(msg =>
            parseInt(msg.historyId!) >= currentHistoryId
            && msg.recipientAddress === emailAddress
            && msg.headers["x-triggered-by"] !== "WorkflowDog"
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
            }).catch(err => {
                console.debug(`Error executing workflow ${w.id}: ${err.message}`)
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

