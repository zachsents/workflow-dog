import type { DB, WorkflowRuns } from "core/db"
import { getPlanData } from "core/plans"
import type { Request, Response } from "express"
import { sql, type Insertable, type Kysely, type Transaction } from "kysely"
import _mapValues from "lodash/mapValues"
import _merge from "lodash/merge"
import SuperJSON from "superjson"
import type { ServerEvent } from "workflow-packages/lib/types"
import { decodeValue, encodeValue } from "workflow-packages/lib/value-types.server"
import { ServerEventSources, ServerEventTypes, ServerNodeDefinitions } from "workflow-packages/server"
import { z } from "zod"
import { RUN_QUEUE, RUN_QUEUE_EVENTS } from "../bullmq"
import { db } from "../db"
import { useEnvVar } from "../utils"
import { getCurrentBillingPeriod } from "./projects"


export async function handleEventSourceRequest(req: Request, res: Response) {

    const eventSourceId = req.params.eventSourceId
    const eventSource = await db.selectFrom("event_sources")
        .selectAll()
        .where("id", "=", eventSourceId)
        .executeTakeFirst()

    if (!eventSource)
        return res.status(404).send("Invalid event source: " + eventSourceId)

    const eventSourceDef = ServerEventSources[eventSource.definition_id]
    console.debug(`Received request for ${eventSourceDef.name} (${eventSourceDef.id}) event source\nEvent source ID: ${eventSourceId}`)

    const genEventsTask = (async () => eventSourceDef.generateEvents(req, eventSource))()
        .then(r => ({
            ...r,
            events: r?.events?.map(ev => ({ ...ev, source: eventSource.definition_id })) ?? [],
        }))
        .catch(err => {
            console.debug("Encountered an error while generating events for event source " + eventSourceDef.id)
            console.error(err)
            return { events: [] as ServerEvent[], state: undefined }
        })

    const updateStateTask = genEventsTask.then(async r => {
        if (r.state)
            return db.updateTable("event_sources")
                .set({ state: _merge({}, eventSource.state, r.state) })
                .where("id", "=", eventSourceId)
                .executeTakeFirstOrThrow()
    })

    const queryWorkflowsTask = db.selectFrom("workflows_event_sources")
        .innerJoin("workflows", "workflows.id", "workflows_event_sources.workflow_id")
        .select(["workflows.id", "workflows.project_id", "trigger_config", "trigger_event_type_id"])
        .where("event_source_id", "=", eventSourceId)
        .where("workflows.is_enabled", "=", true)
        .execute()

    const [{ events }, subscribedWorkflows] = await Promise.all([genEventsTask, queryWorkflowsTask])

    console.log(`Generated events (${events.length}):` + events.map(e => `\n\t- ${e.type}`).join(""))
    console.log(`Found subscribed workflows (${subscribedWorkflows.length}):` + subscribedWorkflows.map(w => `\n\t- ${w.id}`).join(""))

    let newRunsData = await Promise.all(
        subscribedWorkflows.map(async wf => {
            const eventType = ServerEventTypes[wf.trigger_event_type_id]
            const relevantEvents = events.filter(ev => ev.type === wf.trigger_event_type_id)

            const runData = await Promise.all(relevantEvents.map(
                ev => (async () => eventType.generateRunsFromEvent(ev, wf.trigger_config))().catch(err => {
                    console.debug("Encountered an error while generating runs for workflow " + wf.id, ev)
                    console.error(err)
                    return [] as any[]
                })
            )).then(r => r.filter(Boolean).flat())

            if (runData.length === 0)
                return [] as Insertable<WorkflowRuns>[]

            const newRuns: Insertable<WorkflowRuns>[] = runData.map(data => ({
                workflow_id: wf.id,
                project_id: wf.project_id,
                event_payload: data && _mapValues(data, v => JSON.stringify(encodeValue(v))),
            }))

            return newRuns
        })
    ).then(r => r.flat())

    // filter out runs that put its respective project over the workflow run limit
    await Promise.all(
        Array.from(new Set(subscribedWorkflows.map(wf => wf.project_id))).map(async projectId => {
            const { billing_plan, billing_start_date } = await db.selectFrom("projects")
                .select(["billing_plan", "billing_start_date"])
                .where("id", "=", projectId)
                .executeTakeFirstOrThrow()

            const billingPeriod = getCurrentBillingPeriod(billing_start_date)

            const runCount = await db.selectFrom("workflow_runs")
                .select(sql<string>`count(*)`.as("run_count"))
                .where("project_id", "=", projectId)
                .where("created_at", ">=", billingPeriod.start)
                .where("created_at", "<", billingPeriod.end)
                .executeTakeFirstOrThrow()
                .then(r => parseInt(r.run_count))

            let remaining = getPlanData(billing_plan).workflowRunLimit - runCount
            const before = newRunsData.length
            newRunsData = newRunsData.filter(r =>
                r.project_id !== projectId || remaining-- > 0
            )
            if (before !== newRunsData.length)
                console.log(`Removed ${before - newRunsData.length} run(s) for project (${projectId}) because it went over the workflow run limit.`)
        })
    )

    const generatedAnyRuns = newRunsData.length > 0
    await updateStateTask // has been running in background

    if (!generatedAnyRuns) {
        return res.status(200).json({ runs: [] })
    }

    // insert new runs into the database
    const newRuns = await db.insertInto("workflow_runs")
        .values(newRunsData)
        .returning(["id"])
        .execute()

    //  check if any of these runs will need to respond synchronously
    const runsThatRespond = await db.selectFrom("workflow_runs")
        .innerJoin("workflow_snapshots", "workflow_runs.snapshot_id", "workflow_snapshots.id")
        .select(["workflow_runs.id", "snapshot_id", "workflow_snapshots.graph"])
        .where("workflow_runs.id", "in", newRuns.map(r => r.id))
        .execute()
        .then(rows => {
            // the boolean represents whether the workflow responds synchronously
            const analyzedSnapshots = new Map<string, boolean>()

            return rows.filter(r => {
                if (!analyzedSnapshots.has(r.snapshot_id!)) {
                    const { success, data } = z.object({
                        nodes: z.object({
                            id: z.string(),
                            definitionId: z.string(),
                        }).passthrough().array(),
                    }).strip().safeParse(SuperJSON.parse(r.graph))

                    if (!success)
                        return false

                    const respondsSync = data.nodes.some(n => ServerNodeDefinitions[n.definitionId].respondsToTriggerSynchronously)
                    analyzedSnapshots.set(r.snapshot_id!, respondsSync)
                }

                return analyzedSnapshots.get(r.snapshot_id!)!
            }).map(r => r.id)
        })

    // add new runs to the queue
    const jobs = await RUN_QUEUE.addBulk(newRuns.map(r => ({
        name: r.id,
        data: { workflowRunId: r.id },
    })))

    // if there are no runs that respond synchronously, we can just respond immediately with a 202
    if (runsThatRespond.length === 0) {
        return res.status(202).json({
            runs: newRuns.map(r => ({
                id: r.id,
                statusUrl: useEnvVar("APP_ORIGIN") + "/api/workflow-runs/" + r.id + "/status?with_outputs",
            }))
        })
    }

    // otheriwse, wait for the first valid response
    const winningResponseData = await new Promise<Record<string, any> | undefined>((resolve) => {
        let completed = 0

        const completionHandler = async ({ jobId }: { jobId: string }) => {
            const runId: string | undefined = jobs.find(j => j.id === jobId)?.data?.workflowRunId

            if (!runId || !runsThatRespond.includes(runId)) return
            completed++

            const responseData = await db.selectFrom("workflow_run_outputs")
                .select(["handle_id", "value"])
                .where("workflow_run_id", "=", runId)
                .where("is_global", "=", true)
                .execute()
                .then(rows => Object.fromEntries(
                    rows.map(r => [r.handle_id, decodeValue(JSON.parse(r.value))] as const)
                ))

            // good response -- resolve with it
            if (Object.keys(responseData).length > 0) {
                resolve(responseData)
                RUN_QUEUE_EVENTS.off("completed", completionHandler)
                return
            }

            // there's still more runs to check -- keep waiting
            if (completed < runsThatRespond.length)
                return

            // no more runs to check -- resolve with undefined
            resolve(undefined)
            RUN_QUEUE_EVENTS.off("completed", completionHandler)
            return
        }

        RUN_QUEUE_EVENTS.on("completed", completionHandler)
    })

    if (winningResponseData)
        await eventSourceDef.handleResponse?.(res, winningResponseData)

    // fallback to 204 if the response handler didn't do it
    if (!res.writableEnded)
        res.sendStatus(204)
}


export async function cleanupEventSourcesForWorkflow(workflowId: string, {
    dbHandle = db,
    excludedEventSources = [],
}: {
    dbHandle?: Kysely<DB> | Transaction<DB>
    /** A list of event source IDs to exclude from cleanup */
    excludedEventSources?: string[]
} = {}) {

    const [existingSourcesForThisWorkflow, eventTypeId] = await Promise.all([
        dbHandle.selectFrom("workflows_event_sources")
            .innerJoin("event_sources", "event_sources.id", "workflows_event_sources.event_source_id")
            .selectAll("event_sources")
            .where("workflow_id", "=", workflowId)
            .execute(),
        dbHandle.selectFrom("workflows")
            .select("trigger_event_type_id")
            .where("id", "=", workflowId)
            .executeTakeFirstOrThrow()
            .then(r => r.trigger_event_type_id),
    ])

    const cleanupTasks = existingSourcesForThisWorkflow
        .filter(eventSource => !excludedEventSources.includes(eventSource.id))
        .map(async eventSource => {
            const { being_used_elsewhere } = await dbHandle.selectFrom("workflows_event_sources")
                .select(sql<boolean>`count(*) > 1`.as("being_used_elsewhere"))
                .where("event_source_id", "=", eventSource.id)
                .executeTakeFirstOrThrow()

            // not being used anywhere else -- full cleanup
            if (!being_used_elsewhere) {
                const eventSourceDef = ServerEventSources[eventSource.definition_id]
                await eventSourceDef.cleanup?.(eventSource)
                await dbHandle.deleteFrom("workflows_event_sources")
                    .where("event_source_id", "=", eventSource.id)
                    .execute()
                await dbHandle.deleteFrom("event_sources")
                    .where("id", "=", eventSource.id)
                    .execute()
                return
            }

            const { being_used_elsewhere_with_same_event_type } = await dbHandle.selectFrom("workflows_event_sources")
                .innerJoin("workflows", "workflows.id", "workflows_event_sources.workflow_id")
                .select(sql<boolean>`count(*) > 1`.as("being_used_elsewhere_with_same_event_type"))
                .where("event_source_id", "=", eventSource.id)
                .where("workflows.trigger_event_type_id", "=", eventTypeId)
                .executeTakeFirstOrThrow()

            // being used elsewhere but not with this event type -- remove event type
            if (!being_used_elsewhere_with_same_event_type) {
                const eventSourceDef = ServerEventSources[eventSource.definition_id]
                const result = await eventSourceDef.removeEventTypes?.(eventSource, [eventTypeId])
                await Promise.all([
                    dbHandle.updateTable("event_sources")
                        .set({
                            enabled_event_types: sql`array_remove(enabled_event_types, ${eventTypeId})`,
                            state: _merge({}, eventSource.state ?? {}, result?.state ?? {}),
                        })
                        .where("id", "=", eventSource.id)
                        .executeTakeFirstOrThrow(),
                    dbHandle.deleteFrom("workflows_event_sources")
                        .where("event_source_id", "=", eventSource.id)
                        .where("workflow_id", "=", workflowId)
                        .execute(),
                ])
                return
            }

            // just delete relationship
            await dbHandle.deleteFrom("workflows_event_sources")
                .where("event_source_id", "=", eventSource.id)
                .where("workflow_id", "=", workflowId)
                .execute()
        })

    await Promise.all(cleanupTasks)
}