import { db } from "@web/lib/server/db"
import { resend } from "@web/lib/server/resend"
import { errorResponse } from "@web/lib/server/router"
import { supabaseVerifyJWT } from "@web/lib/server/supabase"
import { NextResponse, type NextRequest } from "next/server"


export async function POST(req: NextRequest) {

    const vf = supabaseVerifyJWT(req)

    if (!(vf.verified && vf.payload.role === "service_role"))
        return errorResponse("Unauthorized", 401)

    const data = await req.json()
    const newUser = data.record

    const [firstName, lastName] = ((
        newUser.raw_user_meta_data.full_name || newUser.raw_user_meta_data.name
    ) as string).split(" ")

    const dbQueries = (async () => {
        // Create personal project
        const { id: newProjectId } = await db.insertInto("projects")
            .values({
                name: `${firstName || "My"} First Project`,
                creator: newUser.id,
            })
            .returning("id")
            .executeTakeFirstOrThrow()

        // Create user meta row
        await db.insertInto("user_meta")
            .values({
                id: newUser.id,
                personal_project_created: true,
                personal_project_id: newProjectId,
            })
            .executeTakeFirstOrThrow()
    })()

    // Register with Resend
    const resendReq = resend.contacts.create({
        firstName,
        lastName,
        audienceId: process.env.RESEND_GENERAL_AUDIENCE_ID!,
        email: newUser.email,
    })

    // TO DO: send welcome email

    await Promise.all([dbQueries, resendReq])

    return NextResponse.json({ success: true })
}