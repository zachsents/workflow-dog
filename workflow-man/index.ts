import express from "express"
import morgan from "morgan"
import { client, updateRun } from "./db.js"
import { runWorkflow } from "./execution.js"
import { getAccessToken, projectId } from "./secrets.js"


const port = process.env.PORT ? parseInt(process.env.PORT) : 8081


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */
const app = express()
// app.use(cors())
app.use(express.json())
app.use(morgan("dev"))


// Entrypoint for Task Queue
app.post("/workflow-runs/:runId/execute", async (req, res) => {

    const { data: { workflows: workflow, ...run } } = await client
        .from("workflow_runs")
        .select("*, workflows (id, graph, is_enabled)")
        .eq("id", req.params.runId)
        .single()
        .throwOnError()

    if (run.status === "cancelled") {
        res.status(200).send("Run was cancelled. Not running")
        return
    }

    if (!["pending", "scheduled"].includes(run.status)) {
        res.status(200).send("Run is not pending or scheduled. Not running")
        return
    }

    if (!workflow.is_enabled) {
        await updateRun(req.params.runId, {
            status: "failed",
            has_errors: true,
            finished_at: new Date().toISOString(),
            state: {
                errors: { "workflow": "Workflow is disabled" }
            },
        })
        res.status(200).send("Workflow is disabled. Not running")
        return
    }

    await updateRun(req.params.runId, {
        status: "running",
        started_at: new Date().toISOString(),
    })

    const runState = await runWorkflow(run, workflow)

    await updateRun(req.params.runId, {
        status: "completed",
        has_errors: Object.keys(runState.errors).length > 0,
        finished_at: new Date().toISOString(),
        state: runState,
    })

    res.sendStatus(201)
})


// Create workflow run
app.post("/workflows/:workflowId/run", async (req, res) => {

    const { data: { id: newRunId } } = await client
        .from("workflow_runs")
        .insert({
            workflow_id: req.params.workflowId,
            trigger_data: req.body.triggerData,
            ...req.body.scheduledFor && {
                status: "scheduled",
                scheduled_for: req.body.scheduledFor,
            }
        })
        .select("id")
        .single()
        .throwOnError()

    const taskParent = `projects/${projectId}/locations/us-central1/queues/workflow-runs/tasks`

    await fetch(`https://cloudtasks.googleapis.com/v2beta3/${taskParent}`, {
        method: "post",
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            task: {
                name: `${taskParent}/${newRunId}`,
                httpRequest: {
                    url: `${process.env.CLOUD_RUN_URL}/workflow-runs/${newRunId}/execute`,
                },
                ...req.body.scheduledFor && {
                    scheduleTime: {
                        seconds: Math.floor(new Date(req.body.scheduledFor).getTime() / 1000),
                        nanos: 0,
                    }
                }
            }
        }),
    })
        .then(res => res.json())
        .then(res => res.error ? Promise.reject(res.error) : res)

    res.status(201).send({ id: newRunId })
})


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("WorkflowMan running on port", port, `(${process.env.NODE_ENV})`)
})
