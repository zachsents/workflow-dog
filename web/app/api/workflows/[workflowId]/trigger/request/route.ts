import { remapError } from "@web/lib/server/supabase"
import { supabaseServerAdmin } from "@web/lib/server/supabase-admin"
import { NextRequest, NextResponse } from "next/server"


async function all(req: NextRequest, {
    params: { workflowId }
}: {
    params: { workflowId: string }
}) {

    const supabase = await supabaseServerAdmin()

    const triggerQuery = await supabase
        .from("workflows")
        .select("triggerType:trigger->type, triggerConfig:trigger->config")
        .eq("id", workflowId)
        .single()

    let error = remapError(triggerQuery)
    if (error) return error

    const { triggerType, triggerConfig } = triggerQuery.data!

    if (triggerType !== "https://triggers.workflow.dog/basic/request") {
        return NextResponse.json({ error: "This workflow does not have a URL Request trigger" }, { status: 400 })
    }

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`)

    const waitUntilFinished: boolean = (triggerConfig as any)?.waitUntilFinished
    if (waitUntilFinished) {
        url.searchParams.set("subscribe", "true")
    }

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            triggerData: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: await req.text(),
                params: Object.fromEntries(req.nextUrl.searchParams.entries()),
            },
        })
    }).then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    })

    if (!waitUntilFinished) {
        return new Response("", { status: 204 })
    }

    const { status, headers, body } = response.state?.workflowOutputs ?? {}

    return new Response(body ?? "", {
        headers: headers ?? {},
        status: status ?? (response.has_errors ? 500 : 200),
    })
}


export const GET = all
export const POST = all
export const PUT = all
export const PATCH = all
export const DELETE = all
export const HEAD = all