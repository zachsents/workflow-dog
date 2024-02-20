import { client } from "@api/db.js"
import { fetchGoogleApi } from "@api/google.js"
import { Request, Response } from "express"


export async function post(req: Request, res: Response) {
    const { data } = await client
        .from("workflow_runs")
        .select("count")
        .eq("workflow_id", req.params.workflowId)
        .order("created_at", { ascending: false })
        .limit(1)
        .throwOnError()

    const count = data?.[0]?.count

    if (req.body.copyTriggerDataFrom) {
        const { data: { trigger_data } } = await client
            .from("workflow_runs")
            .select("trigger_data")
            .eq("id", req.body.copyTriggerDataFrom)
            .eq("workflow_id", req.params.workflowId)
            .single()
            .throwOnError()
        req.body.triggerData = trigger_data
    }

    const { data: { id: newRunId } } = await client
        .from("workflow_runs")
        .insert({
            workflow_id: req.params.workflowId,
            trigger_data: req.body.triggerData,
            count: (count || 0) + 1,
            ...req.body.scheduledFor && {
                status: "scheduled",
                scheduled_for: req.body.scheduledFor,
            }
        })
        .select("id")
        .single()
        .throwOnError()

    await fetchGoogleApi({
        api: "cloudtasks",
        version: "v2beta3",
        resourcePath: "queues/workflow-runs/tasks",
        method: "POST",
    }, ({ fullResourcePath }) => ({
        task: {
            name: `${fullResourcePath}/${newRunId}`,
            httpRequest: {
                url: `${process.env.WORKFLOW_MAN_URL}/workflow-runs/${newRunId}/execute`,
            },
            ...req.body.scheduledFor && {
                scheduleTime: {
                    seconds: Math.floor(new Date(req.body.scheduledFor).getTime() / 1000),
                    nanos: 0,
                }
            }
        }
    }))

    if (!("subscribe" in req.query)) {
        res.status(201).send({ id: newRunId })
        return
    }

    const finishedRun = await new Promise((resolve, reject) => {
        const channel = client
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

    res.send(finishedRun)
}