import { getAuth, parent } from "@web/lib/server/google"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { google } from "googleapis"
import { NextResponse } from "next/server"
import { z } from "zod"


const bodySchema = z.object({
    copyTriggerDataFrom: z.string().optional(),
    scheduledFor: z.string().optional(),
    triggerData: z.any(),
})


export async function POST(
    req: Request,
    { params: { workflowId } }: { params: { workflowId: string } }
) {
    const supabase = await supabaseServerAdmin()

    /*
     * Get the count so we can increment it. Should technically be done in a transaction
     * but it's purely for display purposes so it's fine.
     */
    const { data } = await supabase
        .from("workflow_runs")
        .select("count")
        .eq("workflow_id", workflowId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    const count = data?.count || 0

    const validatedBody = bodySchema.safeParse(await req.json())

    if (!validatedBody.success) {
        return NextResponse.json(validatedBody.error, { status: 400 })
    }

    const reqBody = validatedBody.data

    if (reqBody.copyTriggerDataFrom) {
        const query = await supabase
            .from("workflow_runs")
            .select("trigger_data")
            .eq("id", reqBody.copyTriggerDataFrom)
            .eq("workflow_id", workflowId)
            .single()
            .throwOnError()

        reqBody.triggerData = query.data?.trigger_data
    }

    const insertRunQuery = await supabase
        .from("workflow_runs")
        .insert({
            workflow_id: workflowId,
            trigger_data: reqBody.triggerData,
            count: count + 1,
            ...reqBody.scheduledFor && {
                status: "scheduled",
                scheduled_for: reqBody.scheduledFor,
            },
        })
        .select("id")
        .single()
        .throwOnError()

    const newRunId = insertRunQuery.data?.id

    console.debug(`Sending run (${newRunId}) to`, process.env.WORKFLOW_MAN_URL)

    if (process.env.NODE_ENV === "development") {
        fetch(`${process.env.WORKFLOW_MAN_URL}/workflow-runs/${newRunId}/execute`, {
            method: "POST"
        })
    }

    if (process.env.NODE_ENV === "production") {
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

    if (!(new URL(req.url).searchParams.has("subscribe"))) {
        return NextResponse.json({
            id: newRunId,
            count: count + 1,
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