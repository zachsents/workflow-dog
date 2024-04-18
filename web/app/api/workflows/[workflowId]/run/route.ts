import { getAuth, parent } from "@web/lib/server/google"
import { getProjectBilling } from "@web/lib/server/projects"
import { errorResponse } from "@web/lib/server/router"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { PlanLimits } from "@web/modules/plan-limits"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


const bodySchema = z.object({
    copyTriggerDataFrom: z.string().optional(),
    scheduledFor: z.string().optional(),
    triggerData: z.any(),
})


export async function POST(
    req: NextRequest,
    { params: { workflowId } }: { params: { workflowId: string } }
) {
    const validatedBody = bodySchema.safeParse(await req.json())
    if (!validatedBody.success)
        return NextResponse.json(validatedBody.error, { status: 400 })
    const reqBody = validatedBody.data

    const supabase = await supabaseServerAdmin()

    const projectId = await supabase
        .from("workflows")
        .select("team_id")
        .eq("id", workflowId)
        .single()
        .throwOnError()
        .then(q => q.data?.team_id)

    if (!projectId)
        return errorResponse("Workflow not found", 404)

    const billing = await getProjectBilling(projectId, { admin: true })
    const usageLimit = PlanLimits[billing.plan].workflowRuns

    const usageCount = await supabase
        .rpc("count_workflow_runs_for_project", {
            project_id: projectId,
            after: billing.period.start.toISOString(),
        })
        .throwOnError()
        .then(q => q.data || 0)

    if (usageCount >= usageLimit)
        return errorResponse(`Usage limit exceeded (${usageCount} / ${usageLimit})`, 429, {
            needsUpgrade: true,
            upgradeUrl: req.nextUrl.origin + `/projects/${projectId}/usage/upgrade`,
        })

    const queueQuery = await supabase
        .rpc("queue_workflow_run", {
            _workflow_id: workflowId,
            json_body: reqBody,
        })

    if (queueQuery.error) {
        console.debug("Error from queue RPC", queueQuery.error)
        return errorResponse(queueQuery.error.message, 500)
    }

    const newRunId = queueQuery.data

    console.debug(`Sending run (${newRunId}) to`, process.env.WORKFLOW_MAN_URL)

    if (process.env.NODE_ENV === "development") {
        fetch(`${process.env.WORKFLOW_MAN_URL}/workflow-runs/${newRunId}/execute`, {
            method: "POST"
        })
    }
    else if (process.env.NODE_ENV === "production") {
        await google.cloudtasks({
            version: "v2",
            auth: getAuth(),
        }).projects.locations.queues.tasks.create({
            parent: parent("queues/workflow-runs"),
            requestBody: {
                task: {
                    name: parent(`queues/workflow-runs/tasks/${newRunId}`),
                    httpRequest: {
                        url: `${process.env.WORKFLOW_MAN_URL}/workflow-runs/${newRunId}/execute`,
                    },
                    ...reqBody.scheduledFor && {
                        scheduleTime: new Date(reqBody.scheduledFor).toISOString(),
                    },
                },
            },
        })
    }

    if (!req.nextUrl.searchParams.has("subscribe")) {
        return NextResponse.json({
            id: newRunId,
        }, { status: 201 })
    }

    const finishedRun = await new Promise((resolve, reject) => {
        const channel = supabase
            .channel(`workflow_run-${newRunId}-changes`)
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "workflow_runs",
                filter: `id=eq.${newRunId}`,
            }, (payload) => {
                if (!["completed", "failed"].includes(payload.new.status))
                    return

                if (payload.errors?.length > 0)
                    reject(payload.errors)

                channel.unsubscribe()
                resolve(payload.new)
            })
            .subscribe()
    })

    return NextResponse.json(finishedRun, { status: 200 })
}