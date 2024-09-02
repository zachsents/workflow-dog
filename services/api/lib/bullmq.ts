import axios from "axios"
import { Queue, Worker } from "bullmq"
import IORedis from "ioredis"
import { sql } from "kysely"
import { db } from "./db"
import { useEnvVar } from "./utils"


const connection = new IORedis({
    host: "redis",
    port: parseInt(useEnvVar("REDIS_PORT")),
    password: useEnvVar("REDIS_PASSWORD"),
    maxRetriesPerRequest: null,
})

/**
 * Simply acts as a proxy to our event-generation endpoint.
 * Some events will come in as webhooks directly to the API,
 * but others will happen as scheduled jobs through this queue.
 */
export const EVENT_QUEUE = new Queue("events", {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
    },
})

new Worker("events", async (job) => {
    console.log("[Bull] running job", job.name)
    const res = await axios.post(`http://api:${useEnvVar("PORT")}/api/run/${job.name}`, job.data)
    console.log("[Bull] job", job.name, "returned status", res.status)
}, { connection })


/**
 * Queue for running workflows. This is where the actual workflow
 * execution happens. In the future, we can throttle, prioritize,
 * and even scale this horizontally.
 */
export const RUN_QUEUE = new Queue("runs", {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
    },
})

new Worker("runs", async (job) => {
    console.log("[Bull] starting dry workflow run", job.data.workflowRunId)
    const [{ graph }] = await Promise.all([
        db.selectFrom("workflow_runs")
            .innerJoin("workflows", "workflows.id", "workflow_runs.workflow_id")
            .select("graph")
            .where("workflow_runs.id", "=", job.data.workflowRunId)
            .executeTakeFirstOrThrow(),
        db.updateTable("workflow_runs")
            .set({ started_at: sql`now()`, status: "running" })
            .where("id", "=", job.data.workflowRunId)
            .executeTakeFirstOrThrow(),
    ])

    // TO DO: implement workflow execution here
    console.log("[Bull] exec...", job.data.workflowRunId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(graph)

    await db.updateTable("workflow_runs")
        .set({ finished_at: sql`now()`, status: "completed" })
        .where("id", "=", job.data.workflowRunId)
        .executeTakeFirstOrThrow()
    console.log("[Bull] finished dry workflow run", job.data.workflowRunId)
}, { connection })