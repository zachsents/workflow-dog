import RequestTrigger from "@pkg/data/triggers/basic/request.shared"
import { db } from "@web/lib/server/db"
import { queueWorkflow } from "@web/lib/server/internal"
import { errorResponse } from "@web/lib/server/router"
import { NextRequest, NextResponse } from "next/server"


async function all(req: NextRequest, {
    params: { workflowId }
}: {
    params: { workflowId: string }
}) {

    const triggers = await db.selectFrom("triggers")
        .select(["id", "def_id"])
        .where("workflow_id", "=", workflowId)
        .execute()

    const requestTrigger = triggers.find(t => t.def_id === RequestTrigger.id)

    if (!requestTrigger)
        return errorResponse("This workflow does not have a URL Request trigger", 400)

    const newRunId = await queueWorkflow(workflowId, {
        triggerId: requestTrigger.id,
        triggerData: {
            method: req.method.toUpperCase(),
            headers: Object.fromEntries(req.headers.entries()),
            params: Object.fromEntries(req.nextUrl.searchParams.entries()),
            body: await req.text(),
        },
    })

    // TO DO: implement workflow outputs

    return NextResponse.json({ runId: newRunId })
}


export const maxDuration = 300

export const GET = all
export const POST = all
export const PUT = all
export const PATCH = all
export const DELETE = all
export const HEAD = all