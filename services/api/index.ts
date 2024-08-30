import { createExpressMiddleware } from "@trpc/server/adapters/express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import type { WorkflowRuns } from "core/db"
import cors from "cors"
import express from "express"
import { type Insertable } from "kysely"
import _ from "lodash"
import morgan from "morgan"
import supertokens from "supertokens-node"
import {
    errorHandler as supertokensErrorHandler,
    middleware as supertokensMiddleware
} from "supertokens-node/framework/express"
import { ServerEventSources, ServerEventTypes } from "workflow-packages/server"
import { initSupertokens } from "./lib/auth"
import { db } from "./lib/db"
import { useEnvVar } from "./lib/utils"
import { createContext } from "./trpc"
import { apiRouter } from "./trpc/router"
import "./lib/bullmq"
import { RUN_QUEUE } from "./lib/bullmq"


const port = process.env.PORT || 3001
const app = express()

initSupertokens()

// Middleware - CORS
app.use(cors({
    origin: useEnvVar("APP_ORIGIN"),
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
}))

// Middleware - prevent morgan from logging health checks
app.use((req, res, next) => {
    if (req.path !== "/api/health")
        return morgan("dev")(req, res, next)
    next()
})

// Middleware - supertokens
// must be after cors
app.use(supertokensMiddleware())

// Middleware - cookie parser
app.use(cookieParser())

// TRPC router
app.use("/api/trpc", createExpressMiddleware({
    router: apiRouter,
    createContext,
}))

// Health check -- see Docker compose file
app.get("/api/health", (_, res) => void res.send("ok"))

// Event source handler
app.all("/api/run/*", bodyParser.raw({ type: "*/*" }), async (req, res) => {
    const eventSourceId = (req.params as any)[0]
    const eventSource = await db.selectFrom("event_sources")
        .selectAll()
        .where("id", "=", eventSourceId)
        .executeTakeFirst()

    if (!eventSource)
        return res.status(404).send("Invalid event source: " + eventSourceId)

    const eventSourceDef = ServerEventSources[eventSource.definition_id]
    console.debug(`Received request for ${eventSourceDef.name} (${eventSourceDef.id}) event source\nEvent source ID: ${eventSourceId}`)

    const genEventsTask = Promise.resolve(eventSourceDef.generateEvents(req, eventSource))
        .then(r => ({
            ...r,
            events: r.events.map(ev => ({ ...ev, source: eventSource.definition_id })),
        }))

    const updateStateTask = genEventsTask.then(async r => {
        if (r.state)
            return db.updateTable("event_sources")
                .set({ state: _.merge({}, eventSource.state, r.state) })
                .where("id", "=", eventSourceId)
                .executeTakeFirstOrThrow()
    })

    const queryWorkflowsTask = db.selectFrom("workflows_event_sources")
        .innerJoin("workflows", "workflows.id", "workflows_event_sources.workflow_id")
        .select(["workflows.id", "trigger_config", "trigger_event_type_id"])
        .where("event_source_id", "=", eventSourceId)
        .where("workflows.is_enabled", "=", true)
        .execute()

    const [{ events }, subscribedWorkflows] = await Promise.all([genEventsTask, queryWorkflowsTask])

    console.log(`Generated events (${events.length}):` + events.map(e => `\n\t- ${e.type}`).join(""))
    console.log(`Found subscribed workflows (${subscribedWorkflows.length}):` + subscribedWorkflows.map(w => `\n\t- ${w.id}`).join(""))

    const newRunsData = await Promise.all(
        subscribedWorkflows.map(async wf => {
            const eventType = ServerEventTypes[wf.trigger_event_type_id]
            const relevantEvents = events.filter(ev => ev.type === wf.trigger_event_type_id)

            const runData = await Promise.all(
                relevantEvents.map(async ev => eventType.generateRunsFromEvent(ev, wf.trigger_config))
            ).then(r => r.filter(Boolean).flat())

            if (runData.length === 0)
                return [] as Insertable<WorkflowRuns>[]

            const { id: snapshotId } =
                await db.selectFrom("workflow_snapshots")
                    .leftJoin("workflows", "workflows.id", "workflow_snapshots.workflow_id")
                    .select("workflow_snapshots.id")
                    .whereRef("workflows.graph", "=", "workflow_snapshots.graph")
                    .whereRef("workflows.trigger_event_type_id", "=", "workflow_snapshots.trigger_event_type_id")
                    .executeTakeFirst()
                ?? await db.insertInto("workflow_snapshots")
                    .values(eb => ({
                        workflow_id: wf.id,
                        trigger_event_type_id: wf.trigger_event_type_id,
                        graph: eb.selectFrom("workflows").select("graph").where("id", "=", wf.id)
                    }))
                    .returning("id")
                    .executeTakeFirstOrThrow()

            const newRuns: Insertable<WorkflowRuns>[] = runData.map(data => ({
                workflow_id: wf.id,
                event_payload: data,
                snapshot_id: snapshotId,
            }))

            return newRuns
        })
    ).then(r => r.flat())

    const generatedAnyRuns = newRunsData.length > 0

    const newRunIds = generatedAnyRuns
        ? await db.insertInto("workflow_runs")
            .values(newRunsData)
            .returning("id")
            .execute()
            .then(r => r.map(r => r.id))
        : []

    if (newRunIds.length > 0)
        await RUN_QUEUE.addBulk(newRunIds.map(id => ({
            name: id,
            data: { workflowRunId: id },
        })))

    await updateStateTask // has been running in background

    res.status(generatedAnyRuns ? 202 : 200).json({ runs: newRunIds })
})


if (process.env.DEV) {
    app.use("/api/panel", async (_, res) => {
        const { renderTrpcPanel } = await import("trpc-panel")
        return res.send(
            renderTrpcPanel(apiRouter, { url: `http://localhost:${port}/api/trpc` })
        )
    })
}

// Error handlers come after routes
app.use(supertokensErrorHandler())

app.listen(port, () => {
    console.log(`WFD API is running on port ${port}`)
    if (process.env.DEV)
        console.log(`-- DEV MODE --\n${useEnvVar("APP_ORIGIN")}/api/panel`)
})
