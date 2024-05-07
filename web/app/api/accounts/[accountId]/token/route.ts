import { createClient } from "@supabase/supabase-js"
import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { Database } from "@web/lib/types/db"
import { NextRequest, NextResponse } from "next/server"


export async function GET(
    req: NextRequest,
    { params: { accountId } }: { params: { accountId: string } }
) {
    const bearerKey = req.headers.get("authorization")?.split("Bearer ")[1] || ""
    const requesterClient = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, bearerKey)

    try {
        const token = await getServiceAccountToken(requesterClient, accountId)
        return NextResponse.json(token)
    }
    catch (err) {
        console.error(err)
        return errorResponse(err.message, err.code ?? 500)
    }
}