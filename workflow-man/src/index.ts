import "./env"
import express from "express"
import morgan from "morgan"
import { WorkflowRun } from "shared/types"
import { client, updateAsRunning, updateRun } from "./db"
import { runWorkflow } from "./execution"


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
        .select("*, workflows (id, graph, is_enabled, team_id)")
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
            error_count: 1,
            finished_at: new Date().toISOString(),
            state: {
                errors: { "workflow": "Workflow is disabled" }
            },
        })
        res.status(200).send("Workflow is disabled. Not running")
        return
    }

    const [, runState] = await Promise.all([
        updateAsRunning(req.params.runId, workflow.id),
        runWorkflow(run, workflow),
    ])

    await updateRun(req.params.runId, {
        status: "completed",
        error_count: Object.keys(runState.errors || {}).length,
        has_errors: Object.keys(runState.errors || {}).length > 0,
        finished_at: new Date().toISOString(),
        state: { ...runState, graph: workflow.graph },
    })

    res.sendStatus(201)
})


if (process.env.NODE_ENV === "development") {
    app.all("/test/run/:workflowId", async (req, res) => {
        const { data: workflow } = await client
            .from("workflows")
            .select("*")
            .eq("id", req.params.workflowId)
            .single()
            .throwOnError()

        const runState = await runWorkflow({
            trigger_data: req.body || {},
        } as WorkflowRun, workflow)

        // console.log(runState)
        res.send(runState)
    })
}


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("WorkflowMan running on port", port, `(${process.env.NODE_ENV})`)
})

