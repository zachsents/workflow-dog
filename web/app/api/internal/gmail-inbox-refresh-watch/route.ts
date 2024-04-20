import { parent } from "@web/lib/server/google"
import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


export async function POST(req: NextRequest) {
    const validation = bodySchema.safeParse(await req.json())
    if (!validation.success)
        return errorResponse("Invalid request body", 400)

    const { serviceAccountId } = validation.data

    const supabase = await supabaseServerAdmin()

    const token = await getServiceAccountToken(supabase, serviceAccountId) as { access_token: string } | null

    await google.gmail("v1").users.watch({
        userId: "me",
        requestBody: {
            labelIds: ["INBOX"],
            labelFilterBehavior: "include",
            topicName: parent("topics/trigger-gmail-email-received", false),
        },
        access_token: token?.access_token!,
    })

    return NextResponse.json({ success: true })
}


const bodySchema = z.object({
    serviceAccountId: z.string(),
})