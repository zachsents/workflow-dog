
Deno.serve(async (req) => {

    const { record: { id: userId, email, raw_user_meta_data: { name } } } = await req.json()
    const [firstName, lastName] = name?.split(/\s+/) || []

    console.info(`New user signed up: ${name || "(no name)"} <${email}>`)

    const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + Deno.env.get("LOOPS_API_KEY"),
        },
        body: JSON.stringify({
            email,
            source: "signup",
            subscribed: true,
            userId,
            firstName,
            lastName,
        })
    })

    if (!res.ok) {
        console.error("Error creating contact in Loops", res.status, await res.text())
        return new Response("Error creating contact in Loops", { status: 500 })
    }

    return new Response()
})