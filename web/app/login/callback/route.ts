import { errorRedirect } from "@web/lib/server/router"
import { supabaseServer } from "@web/lib/server/supabase"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code")

    if (!code)
        return errorRedirect("No code provided", { nextResponse: true })

    const supabase = supabaseServer()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code!)

    if (error)
        return errorRedirect(error.message, { nextResponse: true })

    console.debug(`Logged in as ${data.user.email}`)

    revalidatePath("/projects", "layout")
    return NextResponse.redirect(`${process.env.APP_URL}/projects`)
}