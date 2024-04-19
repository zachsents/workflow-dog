import { TriggerDefinitions } from "@pkg/server"
import { errorResponse } from "@web/lib/server/router"
import { remapError, supabaseServerAdmin } from "@web/lib/server/supabase"
import { waitForRunToFinish } from "@web/lib/server/workflows"
import axios from "axios"
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
    if (error) return errorResponse(error.error.message, 500, error.error)

    const { triggerType, triggerConfig } = triggerQuery.data!

    if (triggerType !== TriggerDefinitions.resolveId("basic/request")) {
        return errorResponse("This workflow does not have a URL Request trigger", 400)
    }

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`)

    const waitUntilFinished: boolean = (triggerConfig as any)?.waitUntilFinished
    if (waitUntilFinished) {
        url.searchParams.set("subscribe", "true")
    }

    try {
        var { data: response } = await axios.post(url.toString(), {
            triggerData: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: await req.text(),
                params: Object.fromEntries(req.nextUrl.searchParams.entries()),
            },
        })
    }
    catch (err) {
        return errorResponse(err.response.data.error.message, 500, err.response.data.error)
    }

    if (!waitUntilFinished)
        return NextResponse.json({
            success: true,
            workflowRunId: response.id,
        }, { status: 202 })

    const finishedRun = await waitForRunToFinish(supabase, response.id)

    const { status, headers, body } = finishedRun.state?.workflowOutputs ?? {}

    const responseOptions = {
        headers: headers ?? {},
        status: status ?? (finishedRun.has_errors ? 500 : 200),
    }

    if (typeof body === "object" && body !== null)
        return NextResponse.json(body, responseOptions)

    return new Response(body || "", responseOptions)
}


export const maxDuration = 300

export const GET = all
export const POST = all
export const PUT = all
export const PATCH = all
export const DELETE = all
export const HEAD = all