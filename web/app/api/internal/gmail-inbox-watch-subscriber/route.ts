import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
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
        .eq("profile->>email", emailAddress)
        .single()
        .throwOnError()
        .then(q => q.data?.id!)

    const token = await getServiceAccountToken(supabase, serviceAccountId) as { access_token: string } | null

    const workflowIds = await supabase
        .from("workflows")
        .select("id")
        .eq("trigger->>type", "https://triggers.workflow.dog/google/gmail-email-received")
        .eq("trigger->config->>googleAccount", serviceAccountId)
        .throwOnError()
        .then(q => q.data?.map(w => w.id) || [])

    return NextResponse.json({
        success: "🤙",
        historyId,
        token: token?.access_token.slice(0, 10) + "...",
        workflowIds,
    })
}


const bodySchema = z.object({
    message: z.object({
        data: z.string().describe("This is the actual notification data, as base64url-encoded JSON."),
        messageId: z.string().describe("This is a Cloud Pub/Sub message id, unrelated to Gmail messages."),
        "publishTime": z.string().datetime().describe("This is the publish time of the message."),
    }),
    subscription: z.string(),
})

const decodedMessageSchema = z.object({
    emailAddress: z.string().email(),
    historyId: z.string().regex(/^\d+$/),
})