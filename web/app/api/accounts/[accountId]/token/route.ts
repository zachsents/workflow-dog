import { createClient } from "@supabase/supabase-js"
import { getTokenForOAuth2Account } from "@web/app/api/oauth2/connect/[serviceId]/_util"
import { errorResponse } from "@web/lib/server/router"
import { Database } from "@web/lib/types/supabase-db"
import { NextRequest, NextResponse } from "next/server"
import { ServiceDefinitions } from "packages/server"


export async function GET(
    req: NextRequest,
    { params: { accountId } }: { params: { accountId: string } }
) {
    const bearerKey = req.headers.get("authorization")?.split("Bearer ")[1] || ""
    const requesterClient = createClient<Database>(process.env.SUPABASE_URL!, bearerKey)

    const { data: account } = await requesterClient
        .from("integration_accounts")
        .select("*")
        .eq("id", accountId)
        .single()
        .throwOnError()

    if (!account)
        return errorResponse("Account not found", 404)

    const service = ServiceDefinitions.get(account.service_id!)

    if (!service)
        return errorResponse("Service not found", 404)

    switch (service.authAcquisition.method) {
        case "oauth2":
            return getTokenForOAuth2Account(account, requesterClient)
        case "key":
            return NextResponse.json({ key: (account.token as any)?.key })
        default:
            return NextResponse.json(account.token)
    }
}