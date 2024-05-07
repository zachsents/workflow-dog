import { errorRedirect } from "@web/lib/server/router"
import { supabaseServer } from "@web/lib/server/supabase"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"


export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code")

    if (!code)
        return errorRedirect("No code provided", { nextResponse: true })

    const supabase = supabaseServer()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code!)
    if (error)
        return errorRedirect(error.message, { nextResponse: true })

    console.debug(`Logged in as ${data.user.email}`)

    const cookieStore = cookies()
    const acceptingInvitation = cookieStore.get("accepting_invitation")
    if (acceptingInvitation) {
        cookieStore.delete("accepting_invitation")
        redirect(`/invitations/${acceptingInvitation.value}/accept`)
    }

    revalidatePath("/projects", "layout")
    redirect("/projects")
}