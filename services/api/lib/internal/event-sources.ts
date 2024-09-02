import type { DB } from "core/db"
import { sql, type Kysely, type Transaction } from "kysely"
import { db } from "../db"
import { ServerEventSources } from "workflow-packages/server"
import _ from "lodash"


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
                            state: _.merge({}, eventSource.state ?? {}, result?.state ?? {}),
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