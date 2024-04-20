import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { google } from "googleapis"
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

    const { emailAddress, historyId } = messageValidation.data

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
        .select("id, startHistoryId:trigger->data->>historyId, trigger")
        .eq("trigger->>type", "https://triggers.workflow.dog/google/gmail-email-received")
        .eq("trigger->config->>googleAccount", serviceAccountId)
        .throwOnError()
        .then(q => q.data || [])

    const oldestHistoryId = workflows
        .map(w => parseInt(w.startHistoryId))
        .reduce((oldest, current) => oldest < current ? oldest : current)
        .toString()

    const { history, historyId: newHistoryId } = await google.gmail("v1").users.history.list({
        userId: "me",
        startHistoryId: oldestHistoryId,
        historyTypes: ["messageAdded"],
    }).then(res => res.data)

    await Promise.all(workflows.map(w => {
        const newTrigger: any = structuredClone(w.trigger)
        newTrigger.data.historyId = newHistoryId
        return supabase
            .from("workflows")
            .update({ trigger: newTrigger })
            .eq("id", w.id)
            .throwOnError()
    }))

    console.log({
        success: "🤙",
        historyId,
        token: token?.access_token.slice(0, 10) + "...",
        workflows,
        history,
    })

    // WILO: figuring out the best way to just set the nested fields
    // maybe a new workflow_triggers table? not sure

    return NextResponse.json({
        success: "🤙",
        historyId,
        token: token?.access_token.slice(0, 10) + "...",
        workflows,
        history,
    })
}


const bodySchema = z.object({
    message: z.object({
        data: z.string()
            .describe("This is the actual notification data, as base64url-encoded JSON."),
        messageId: z.string()
            .describe("This is a Cloud Pub/Sub message id, unrelated to Gmail messages."),
        publishTime: z.string().datetime()
            .describe("This is the publish time of the message."),
    }),
    subscription: z.string(),
})

const decodedMessageSchema = z.object({
    emailAddress: z.string().email(),
    historyId: z.number(),
})