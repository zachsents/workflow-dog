import { TRPCError } from "@trpc/server"
import type { ProjectPermission } from "core/db"
import { WORKFLOW_NAME_SCHEMA } from "core/schemas"
import { sql } from "kysely"
import _ from "lodash"
import { ServerEventSources, ServerEventTypes } from "workflow-packages/server"
import { z } from "zod"
import { authenticatedProcedure } from ".."
import { userHasProjectPermission } from "../../lib/auth-checks"
import { db } from "../../lib/db"
import { assertOrForbidden } from "../assertions"
import { projectPermissionProcedure } from "./projects"
import { cleanupEventSourcesForWorkflow } from "../../lib/internal/event-sources"


export default {
    list: projectPermissionProcedure("read")
        .query(async ({ ctx }) => {
            return db.selectFrom("workflows")
                .leftJoinLateral(
                    eb => eb.selectFrom("workflow_runs")
                        .select(sql<Date>`max(started_at)`.as("last_ran_at"))
                        .whereRef("workflow_id", "=", "workflows.id")
                        .as("sub"),
                    join => join.onTrue()
                )
                .select(["id", "name", "is_enabled", "created_at", "project_id", "trigger_event_type_id", "last_edited_at", "last_ran_at"])
                .where("project_id", "=", ctx.projectId)
                .orderBy("workflows.name")
                .execute()
        }),

    listCallable: projectPermissionByWorkflowProcedure("read")
        .input(z.object({
            excluding: z.array(z.string().uuid()).optional().default([]),
        }))
        .query(async ({ ctx, input }) => {
            return db.selectFrom("workflows")
                .selectAll()
                .where(
                    "project_id", "=",
                    eb => eb.selectFrom("workflows").select("project_id").where("id", "=", ctx.workflowId)
                )
                .where("trigger_event_type_id", "=", "eventType:primitives/callable")
                .where("is_enabled", "=", true)
                .where("id", "not in", input.excluding)
                .orderBy("workflows.name")
                .execute()
        }),

    byId: projectPermissionByWorkflowProcedure("read")
        .query(async ({ ctx, input }) => {
            const [workflow, eventSources] = await Promise.all([
                db.selectFrom("workflows")
                    .leftJoinLateral(
                        eb => eb.selectFrom("workflow_runs")
                            .select(sql<Date>`max(started_at)`.as("last_ran_at"))
                            .whereRef("workflow_id", "=", "workflows.id")
                            .as("sub"),
                        join => join.onTrue()
                    )
                    .selectAll("workflows")
                    .select("last_ran_at")
                    .where("workflows.id", "=", ctx.workflowId)
                    .executeTakeFirst(),
                db.selectFrom("workflows_event_sources")
                    .innerJoin("event_sources", "event_sources.id", "workflows_event_sources.event_source_id")
                    .selectAll()
                    .where("workflow_id", "=", ctx.workflowId)
                    .execute()
            ])

            if (!workflow)
                throw new TRPCError({ code: "NOT_FOUND" })

            return { ...workflow, eventSources }
        }),

    setEnabled: projectPermissionByWorkflowProcedure("write")
        .input(z.object({ isEnabled: z.boolean().optional() }))
        .mutation(async ({ input, ctx }) => {
            return db.updateTable("workflows")
                .set({
                    is_enabled: typeof input.isEnabled === "boolean"
                        ? input.isEnabled
                        : sql<boolean>`not is_enabled`
                })
                .where("id", "=", ctx.workflowId)
                .returning("id")
                .returning("is_enabled")
                .executeTakeFirstOrThrow()
        }),

    rename: projectPermissionByWorkflowProcedure("write")
        .input(z.object({ name: WORKFLOW_NAME_SCHEMA }))
        .mutation(async ({ input, ctx }) => {
            return db.updateTable("workflows")
                .set({ name: input.name })
                .where("id", "=", ctx.workflowId)
                .returning("id")
                .returning("name")
                .executeTakeFirstOrThrow()
        }),

    "delete": projectPermissionByWorkflowProcedure("write")
        .mutation(async ({ ctx }) => {
            return db.transaction().execute(async trx => {
                await cleanupEventSourcesForWorkflow(ctx.workflowId, {
                    dbHandle: trx,
                })

                return trx.deleteFrom("workflows")
                    .where("id", "=", ctx.workflowId)
                    .returning("id")
                    .executeTakeFirstOrThrow()
            })
        }),

    create: projectPermissionProcedure("write")
        .input(z.object({
            name: WORKFLOW_NAME_SCHEMA,
            triggerEventTypeId: z.string().min(1, "You must select a trigger."),
        }))
        .mutation(async ({ input, ctx }) => {
            return db.transaction().execute(async trx => {
                const newWorkflow = await trx.insertInto("workflows")
                    .values({
                        name: input.name,
                        creator: ctx.user.id,
                        project_id: ctx.projectId,
                        trigger_event_type_id: input.triggerEventTypeId,
                    })
                    .returning("id")
                    .executeTakeFirstOrThrow()

                const initializers = await ServerEventTypes[input.triggerEventTypeId].createEventSources({
                    workflowId: newWorkflow.id,
                    projectId: ctx.projectId,
                })

                const initTasks = initializers.map(async init => {
                    const eventSourceDef = ServerEventSources[init.definitionId]

                    const existingSource = await trx.selectFrom("event_sources")
                        .selectAll()
                        .where("id", "=", init.id)
                        .executeTakeFirst()

                    if (existingSource && existingSource.definition_id !== init.definitionId)
                        throw new Error("Event Source definition mismatch. This is a bug.")

                    // CASE 1: Source doesn't exist yet
                    if (!existingSource) {
                        const result = await eventSourceDef.setup?.({
                            initializer: init,
                            enabledEventTypes: [input.triggerEventTypeId],
                        })

                        await trx.insertInto("event_sources").values({
                            id: init.id,
                            definition_id: init.definitionId,
                            enabled_event_types: [input.triggerEventTypeId],
                            state: _.merge({}, init.state ?? {}, result?.state ?? {}),
                        }).executeTakeFirstOrThrow()
                    }

                    // CASE 2: Source already exists, but isn't set up for this event type
                    else if (!existingSource.enabled_event_types.includes(input.triggerEventTypeId)) {
                        const result = await eventSourceDef.addEventTypes?.(existingSource, [input.triggerEventTypeId])

                        await trx.updateTable("event_sources").set({
                            enabled_event_types: [...existingSource.enabled_event_types, input.triggerEventTypeId],
                            state: _.merge({}, existingSource.state ?? {}, init.state ?? {}, result?.state ?? {}),
                        }).where("id", "=", init.id).executeTakeFirstOrThrow()
                    }

                    // CASE 3: Source already exists, and is set up for this event type
                    else {
                        await trx.updateTable("event_sources").set({
                            state: _.merge({}, existingSource.state ?? {}, init.state ?? {}),
                        }).where("id", "=", init.id).executeTakeFirstOrThrow()
                    }

                    await trx.insertInto("workflows_event_sources").values({
                        workflow_id: newWorkflow.id,
                        event_source_id: init.id,
                    }).executeTakeFirstOrThrow()
                })

                await Promise.all(initTasks)
                return newWorkflow
            })
        }),

    saveGraph: projectPermissionByWorkflowProcedure("write")
        .input(z.object({
            graph: z.string(),
            clientTimestamp: z.date(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { last_save_client_timestamp, ...oldWorkflow } = await db.selectFrom("workflows")
                .select(["graph", "last_save_client_timestamp"])
                .where("id", "=", ctx.workflowId)
                .executeTakeFirstOrThrow()

            const isAnOldUpdate = !!last_save_client_timestamp
                && last_save_client_timestamp.getTime() >= input.clientTimestamp.getTime()

            if (isAnOldUpdate)
                return oldWorkflow

            return db.updateTable("workflows")
                .set({
                    graph: input.graph,
                    last_save_client_timestamp: input.clientTimestamp,
                })
                .where("id", "=", ctx.workflowId)
                .returning("graph")
                .executeTakeFirstOrThrow()
        }),

    updateEventSources: projectPermissionByWorkflowProcedure("write")
        .input(z.object({
            eventSourceData: z.any(),
        }))
        .mutation(async ({ input, ctx }) => {
            const workflow = await db.selectFrom("workflows")
                .select(["project_id", "trigger_event_type_id"])
                .where("id", "=", ctx.workflowId)
                .executeTakeFirstOrThrow()

            const initializers = await ServerEventTypes[workflow.trigger_event_type_id].createEventSources({
                workflowId: ctx.workflowId,
                projectId: workflow.project_id,
                data: input.eventSourceData,
            })

            await db.transaction().execute(async trx => {

                const initTasks = initializers.map(async init => {
                    const eventSourceDef = ServerEventSources[init.definitionId]

                    const existingSource = await trx.selectFrom("event_sources")
                        .selectAll()
                        .where("id", "=", init.id)
                        .executeTakeFirst()

                    if (existingSource && existingSource.definition_id !== init.definitionId)
                        throw new Error(`Event Source ID collision: ${init.id} (between ${existingSource.definition_id} and ${init.definitionId})`)

                    // CASE 1: Source doesn't exist yet
                    if (!existingSource) {
                        const result = await eventSourceDef.setup?.({
                            initializer: init,
                            enabledEventTypes: [workflow.trigger_event_type_id],
                        })

                        await trx.insertInto("event_sources")
                            .values({
                                id: init.id,
                                definition_id: init.definitionId,
                                enabled_event_types: [workflow.trigger_event_type_id],
                                state: _.merge({}, init.state ?? {}, result?.state ?? {}),
                            })
                            .executeTakeFirstOrThrow()
                    }

                    // CASE 2: Source already exists, but isn't set up for this event type
                    else if (!existingSource.enabled_event_types.includes(workflow.trigger_event_type_id)) {
                        const result = await eventSourceDef.addEventTypes?.(existingSource, [workflow.trigger_event_type_id])

                        await trx.updateTable("event_sources")
                            .set({
                                enabled_event_types: sql`array_append(enabled_event_types, ${workflow.trigger_event_type_id})`,
                                state: _.merge({}, existingSource.state ?? {}, init.state ?? {}, result?.state ?? {}),
                            })
                            .where("id", "=", init.id)
                            .executeTakeFirstOrThrow()
                    }

                    // CASE 3: Source already exists, and is set up for this event type
                    else {
                        await trx.updateTable("event_sources")
                            .set({
                                state: _.merge({}, existingSource.state ?? {}, init.state ?? {}),
                            })
                            .where("id", "=", init.id)
                            .executeTakeFirstOrThrow()
                    }

                    await trx.insertInto("workflows_event_sources")
                        .values({
                            workflow_id: ctx.workflowId,
                            event_source_id: init.id,
                        })
                        .onConflict(oc => oc.columns(["workflow_id", "event_source_id"]).doNothing())
                        .executeTakeFirstOrThrow()
                })
                await Promise.all(initTasks)

                await cleanupEventSourcesForWorkflow(ctx.workflowId, {
                    dbHandle: trx,
                    excludedEventSources: initializers.map(init => init.id),
                })
            })

            return null
        }),


    runs: {
        list: projectPermissionByWorkflowProcedure("read")
            .input(z.object({
                limit: z.number().min(1).max(100).default(50),
                offset: z.number().min(0).default(0),
                sortColumn: z.enum(["started_at", "error_count", "duration"]).default("started_at"),
                sortDir: z.enum(["asc", "desc"]).default("desc"),
            }))
            .query(async ({ input, ctx }) => {
                const [runs, total] = await Promise.all([
                    db.selectFrom("workflow_runs")
                        .leftJoin("workflow_runs_meta", "workflow_runs.id", "workflow_runs_meta.id")
                        .select([
                            "workflow_runs.id", "status", "node_errors", "started_at", "error_count", "is_starred", "row_number",
                            sql<string>`extract(epoch from (finished_at - started_at)) * 1000`.as("duration"),
                        ])
                        .where("workflow_id", "=", ctx.workflowId)
                        .orderBy(input.sortColumn, input.sortDir)
                        .limit(input.limit)
                        .offset(input.offset)
                        .execute()
                        .then(rows => rows.map(({ duration, ...row }) => ({
                            ...row,
                            duration: parseFloat(duration),
                        }))),
                    db.selectFrom("workflow_runs")
                        .select(sql<string>`count(*)`.as("count"))
                        .where("workflow_id", "=", ctx.workflowId)
                        .executeTakeFirstOrThrow(),
                ])

                return { total: parseInt(total.count), runs }
            }),

        byId: projectPermissionByWorkflowRunProcedure("read")
            .input(z.object({
                withOutputs: z.boolean().default(false),
            }))
            .query(async ({ input, ctx }) => {
                const queryResult = await db.selectFrom("workflow_runs")
                    .leftJoin("workflow_runs_meta", "workflow_runs.id", "workflow_runs_meta.id")
                    .selectAll("workflow_runs")
                    .select(["row_number"])
                    .where("workflow_runs.id", "=", ctx.workflowRunId)
                    .executeTakeFirst()

                if (!queryResult)
                    throw new TRPCError({ code: "NOT_FOUND" })

                const node_outputs = input.withOutputs ? await db.selectFrom("workflow_run_outputs")
                    .select(["node_id", "handle_id", "value"])
                    .where("workflow_run_id", "=", ctx.workflowRunId)
                    .where("is_global", "=", false)
                    .where("node_id", "is not", null)
                    .execute()
                    .then(rows => _.mapValues(
                        _.groupBy(rows, "node_id"),
                        rows => Object.fromEntries(rows.map(row =>
                            [row.handle_id, row.value] as const
                        )) as Record<string, string>,
                    )) : undefined

                return { ...queryResult, node_outputs }
            }),

        setStarred: projectPermissionByWorkflowRunProcedure("write")
            .input(z.object({ isStarred: z.boolean() }))
            .mutation(async ({ input, ctx }) => {
                return db.updateTable("workflow_runs")
                    .set({ is_starred: input.isStarred })
                    .where("id", "=", ctx.workflowRunId)
                    .returning(["id", "is_starred"])
                    .executeTakeFirstOrThrow()
            }),
    },

    snapshots: {
        byId: projectPermissionByWorkflowProcedure("read")
            .input(z.object({ snapshotId: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                const queryResult = await db.selectFrom("workflow_snapshots")
                    .selectAll()
                    .where("id", "=", input.snapshotId)
                    .where("workflow_id", "=", ctx.workflowId)
                    .executeTakeFirst()

                if (!queryResult)
                    throw new TRPCError({ code: "NOT_FOUND" })

                return queryResult
            }),
    },

    // runManually: t.procedure
    //     .input(z.object({
    //         workflowId: z.string().uuid(),
    //         copyTriggerDataFrom: z.string().uuid().optional(),
    //         scheduledFor: z.date().optional(),
    //         triggerData: z.any(),
    //     }))
    //     .mutation(async ({ input, ctx }) => {
    //         const { workflowId, ...queueOptions } = input

    //         assertAuthenticated(ctx)
    //         assert(
    //             await userHasProjectPermission(ctx.userId!, "write")
    //                 .byWorkflowId(input.workflowId),
    //             forbidden()
    //         )

    //         const newRunId = await queueWorkflow(workflowId, {
    //             ...queueOptions,
    //             triggerData: queueOptions.triggerData ?? null,
    //         }).catch(err => {
    //             if (err instanceof WorkflowRunLimitExceededError)
    //                 throw err.toTRPC()
    //             else throw err
    //         })

    //         return newRunId
    //     }),

    // runs: {
    //     list: t.procedure
    //         .input(z.object({ workflowId: z.string().uuid() }))
    //         .query(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.userId!, "read")
    //                     .byWorkflowId(input.workflowId),
    //                 forbidden()
    //             )

    //             const queryResult = await db.selectFrom("workflow_runs")
    //                 .selectAll()
    //                 .where("workflow_id", "=", input.workflowId)
    //                 .orderBy("created_at", "desc")
    //                 .limit(100)
    //                 .execute()

    //             return queryResult.map(enrichWorkflowRunRow)
    //         }),

    //     mostRecent: t.procedure
    //         .input(z.object({ workflowId: z.string().uuid() }))
    //         .query(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.userId!, "read")
    //                     .byWorkflowId(input.workflowId),
    //                 forbidden()
    //             )

    //             const queryResult = await db.selectFrom("workflow_runs")
    //                 .selectAll()
    //                 .where("workflow_id", "=", input.workflowId)
    //                 .orderBy("created_at", "desc")
    //                 .limit(1)
    //                 .executeTakeFirst()

    //             return queryResult
    //                 ? enrichWorkflowRunRow(queryResult)
    //                 : null
    //         }),

    //     byId: t.procedure
    //         .input(z.object({ id: z.string().uuid() }))
    //         .query(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.userId!, "read")
    //                     .byWorkflowRunId(input.id),
    //                 forbidden()
    //             )

    //             const queryResult = await db.selectFrom("workflow_runs")
    //                 .selectAll()
    //                 .where("id", "=", input.id)
    //                 .executeTakeFirst()

    //             if (!queryResult)
    //                 throw new TRPCError({ code: "NOT_FOUND" })

    //             return queryResult
    //         }),
    // },

    // triggers: {
    //     update: t.procedure
    //         .input(z.object({
    //             triggerId: z.string().uuid(),
    //             config: z.object({}).passthrough().optional(),
    //             serviceAccountId: z.string().uuid().optional(),
    //         }))
    //         .mutation(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.userId!, "write")
    //                     .byTriggerId(input.triggerId),
    //                 forbidden()
    //             )

    //             const oldTrigger = await db.selectFrom("triggers")
    //                 .selectAll()
    //                 .where("id", "=", input.triggerId)
    //                 .executeTakeFirstOrThrow()

    //             const newConfig = mergeObjectsOverwriteArrays(
    //                 oldTrigger.config as Record<string, any>,
    //                 input.config || {},
    //             )

    //             const shouldUpdate = !_.isEqual(oldTrigger.config, newConfig)
    //                 || oldTrigger.service_account_id != input.serviceAccountId

    //             if (!shouldUpdate)
    //                 return

    //             const triggerDefinition = TriggerDefinitions.get(oldTrigger.def_id)
    //             if (!triggerDefinition)
    //                 throw new TRPCError({
    //                     code: "INTERNAL_SERVER_ERROR",
    //                     message: `Couldn't find definition for trigger def id: ${oldTrigger.def_id}`,
    //                 })

    //             const newTrigger = {
    //                 ...oldTrigger,
    //                 config: newConfig,
    //                 ...input.serviceAccountId && {
    //                     service_account_id: input.serviceAccountId
    //                 },
    //             } satisfies typeof oldTrigger

    //             const newTriggerState = await triggerDefinition.onChange?.(oldTrigger, newTrigger)

    //             await db.updateTable("triggers")
    //                 .set({
    //                     config: newConfig,
    //                     service_account_id: newTrigger.service_account_id,
    //                     state: mergeObjectsOverwriteArrays(
    //                         oldTrigger.state as Record<string, any>,
    //                         newTriggerState || {},
    //                     ),
    //                 })
    //                 .execute()
    //         }),

    //     assignNew: t.procedure
    //         .input(z.object({
    //             workflowId: z.string().uuid(),
    //             definitionId: z.string(),
    //         }))
    //         .mutation(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.userId!, "write")
    //                     .byWorkflowId(input.workflowId),
    //                 forbidden()
    //             )

    //             const oldTrigger = await db.selectFrom("triggers")
    //                 .selectAll()
    //                 .where("workflow_id", "=", input.workflowId)
    //                 .executeTakeFirst()

    //             const newTrigger: Insertable<Triggers> = {
    //                 config: {},
    //                 service_account_id: null,
    //                 workflow_id: input.workflowId,
    //                 def_id: input.definitionId,
    //             }

    //             const oldDefinition = oldTrigger?.def_id
    //                 ? TriggerDefinitions.get(oldTrigger?.def_id)
    //                 : undefined
    //             const newDefinition = TriggerDefinitions.get(input.definitionId)

    //             // call onChange handlers in parallel
    //             const [, newState] = await Promise.all([
    //                 oldTrigger
    //                     ? oldDefinition?.onChange?.(oldTrigger, null)
    //                     : Promise.resolve(null),
    //                 newTrigger
    //                     ? newDefinition?.onChange?.(null, newTrigger)
    //                     : Promise.resolve(null),
    //             ])

    //             await db.transaction().execute(async trx => {
    //                 await trx.deleteFrom("triggers")
    //                     .where("workflow_id", "=", input.workflowId)
    //                     .execute()

    //                 await trx.insertInto("triggers")
    //                     .values({
    //                         ...newTrigger,
    //                         state: newState || {},
    //                     })
    //                     .execute()
    //             })

    //             return newTrigger
    //         }),
    // },
}


export function projectPermissionByWorkflowProcedure(permission: ProjectPermission) {
    return authenticatedProcedure
        .input(z.object({ workflowId: z.string().uuid() }))
        .use(async ({ ctx, input, next }) => {
            const hasPermission = await userHasProjectPermission(ctx.user.id, permission)
                .byWorkflowId(input.workflowId)
            assertOrForbidden(hasPermission)
            return next({
                ctx: {
                    ...ctx,
                    workflowId: input.workflowId,
                    projectPermission: permission,
                }
            })
        })
}

export function projectPermissionByWorkflowRunProcedure(permission: ProjectPermission) {
    return authenticatedProcedure
        .input(z.object({ workflowRunId: z.string().uuid() }))
        .use(async ({ ctx, input, next }) => {
            const hasPermission = await userHasProjectPermission(ctx.user.id, permission)
                .byWorkflowRunId(input.workflowRunId)
            assertOrForbidden(hasPermission)
            return next({
                ctx: {
                    ...ctx,
                    workflowRunId: input.workflowRunId,
                    projectPermission: permission,
                }
            })
        })
}
