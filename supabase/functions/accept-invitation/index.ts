
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"


Deno.serve(async (req) => {

    const token = new URL(req.url).searchParams.get("token")

    if (!token)
        return new Response("No token provided", { status: 400 })

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: invitation, error } = await supabase.from("team_invitations").select("*").eq("token", token).single()

    if (error)
        console.error(error)

    if (!invitation || error)
        return new Response("Invalid token", { status: 400 })

    if (invitation.status !== "pending")
        return new Response("Invitation is not pending", { status: 400 })

    await supabase.from("users_teams").insert({
        user_id: invitation.user_id,
        team_id: invitation.team_id,
        roles: ["viewer"],
    })

    await supabase.from("team_invitations").delete().eq("token", token)

    return Response.redirect(`https://app.workflow.dog/workflows?team=${invitation.team_id}`, 302)
})