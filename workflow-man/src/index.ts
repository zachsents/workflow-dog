import express from "express"
import { sql, type Selectable } from "kysely"
import morgan from "morgan"
import type { WorkflowGraphs, WorkflowRuns, Workflows } from "shared/db"
import { db } from "./db"
import "./env"
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

    // Fetch the run and workflow
    const { workflow, run, graph } = await db.selectFrom("workflow_runs")
        .leftJoin("workflows", "workflow_runs.workflow_id", "workflows.id")
        .leftJoin("workflow_graphs", "workflow_runs.workflow_graph_id", "workflow_graphs.id")
        .select(sql<Selectable<WorkflowRuns>>`row_to_json(workflow_runs.*)`.as("run"))
        .select(sql<Selectable<Workflows>>`row_to_json(workflows.*)`.as("workflow"))
        .select(sql<Selectable<WorkflowGraphs>>`row_to_json(workflow_graphs.*)`.as("graph"))
        .where("id", "=", req.params.runId)
        .executeTakeFirstOrThrow()

    // Ensure proper run status
    switch (run.status) {
        case "pending":
        case "scheduled":
            break
        case "cancelled":
            return void res.status(200).json({
                message: "Run was cancelled. Not running."
            })
        default:
            return void res.status(200).json({
                message: "Run is not pending or scheduled. Not running."
            })
    }

    // Ensure workflow is enabled
    if (!workflow.is_enabled) {
        await db.updateTable("workflow_runs")
            .set({
                status: "failed",
                global_errors: JSON.stringify(["Workflow is disabled"]),
                finished_at: sql`current_timestamp`,
            })
            .where("id", "=", req.params.runId)
            .executeTakeFirstOrThrow()
        return void res.status(200).json({
            message: "Workflow is disabled. Not running",
        })
    }

    // Update run status to running -- update workflow, too
    const updateAsRunningPromise = db.transaction()
        .execute(async trx => Promise.all([
            trx.updateTable("workflow_runs")
                .set({
                    status: "running",
                    started_at: sql`current_timestamp`,
                })
                .where("id", "=", req.params.runId)
                .executeTakeFirstOrThrow(),

            trx.updateTable("workflows")
                .set({
                    last_ran_at: sql`current_timestamp`,
                })
                .where("id", "=", run.workflow_id)
                .executeTakeFirstOrThrow(),
        ]))

    const [, runResult] = await Promise.all([
        updateAsRunningPromise,
        runWorkflow({ graph, run, workflow }),
    ])

    await db.transaction().execute(async trx => Promise.all([
        trx.updateTable("workflow_runs")
            .set({
                status: "completed",
                node_errors: JSON.stringify(runResult.nodeErrors),
                finished_at: sql`current_timestamp`,
            })
            .where("id", "=", req.params.runId)
            .executeTakeFirstOrThrow(),

        trx.insertInto("workflow_run_node_outputs")
            .values(runResult.nodeOutputs),
    ]))

    res.sendStatus(201)
})


if (process.env.NODE_ENV === "development") {
    app.all("/test/run/:workflowId", async (req, res) => {
        const { graph, ...workflow } = await db.selectFrom("workflows")
            .innerJoin("workflow_graphs", "workflows.current_graph_id", "workflow_graphs.id")
            .selectAll("workflows")
            .select(sql<Selectable<WorkflowGraphs>>`row_to_json(workflow_graphs.*)`.as("graph"))
            .where("id", "=", req.params.workflowId)
            .executeTakeFirstOrThrow()

        const runResult = await runWorkflow({
            workflow,
            graph,
            run: {
                id: "test-run",
                trigger_payload: null,
            },
        })

        res.send(runResult)
    })
}


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("WorkflowMan running on port", port, `(${process.env.NODE_ENV})`)
})

