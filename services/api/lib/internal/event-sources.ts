import type { DB, WorkflowRuns } from "core/db"
import { sql, type Insertable, type Kysely, type Transaction } from "kysely"
import { db } from "../db"
import { ServerEventSources, ServerEventTypes } from "workflow-packages/server"
import _merge from "lodash/merge"
import _mapValues from "lodash/mapValues"
import type { Request, Response } from "express"
import type { ServerEvent } from "workflow-packages/lib/types"
import { encodeValue } from "workflow-packages/lib/value-types.server"
import { useEnvVar } from "../utils"
import { RUN_QUEUE } from "../bullmq"


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
                event_payload: data && _mapValues(data, v => JSON.stringify(encodeValue(v))),
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

    res.status(generatedAnyRuns ? 202 : 200).json({
        runs: newRunIds.map(runId => ({
            id: runId,
            statusUrl: useEnvVar("APP_ORIGIN") + "/api/workflow-runs/" + runId + "/status?with_outputs",
        }))
    })

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