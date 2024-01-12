
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"


Deno.serve(async (req) => {

    const { record: { user_id: userId, team_id: teamId, status, token } } = await req.json()

    if (status !== "pending")
        return new Response()

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const email = await supabase.auth.admin.getUserById(userId)
        .then(({ data }) => data.user?.email)

    const teamName = await supabase.from("teams").select("name").eq("id", teamId).single()
        .then(({ data }) => data?.name)

    const res = await fetch("https://app.loops.so/api/v1/transactional", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + Deno.env.get("LOOPS_API_KEY"),
        },
        body: JSON.stringify({
            transactionalId: "clr9urv1100dzkiuqxrbmckvg",
            email,
            dataVariables: {
                teamName,
                token,
            },
        }),
    })

    if (!res.ok) {
        console.error("Error from Loops", res.status, await res.text())
        return new Response("Error from Loops. Check logs.", { status: 500 })
    }

    return new Response()
})