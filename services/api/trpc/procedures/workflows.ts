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


export default {
    list: projectPermissionProcedure("read")
        .query(async ({ ctx }) => {
            return db.selectFrom("workflows")
                .select(["id", "name", "is_enabled", "created_at", "project_id", "trigger_event_type_id", "last_edited_at", "last_ran_at"])
                .where("project_id", "=", ctx.projectId)
                .orderBy("workflows.name")
                .execute()
        }),

    listCallable: projectPermissionProcedure("read")
        .input(z.object({
            excluding: z.array(z.string().uuid()).optional().default([]),
        }))
        .query(async ({ ctx, input }) => {
            return db.selectFrom("workflows")
                .selectAll()
                .where("project_id", "=", ctx.projectId)
                .where("trigger_event_type_id", "=", "eventType:primitives/callable")
                .where("id", "not in", input.excluding)
                .orderBy("workflows.name")
                .execute()
        }),

    byId: projectPermissionByWorkflowProcedure("read")
        .query(async ({ ctx, input }) => {
            const workflow = await db.selectFrom("workflows")
                .selectAll()
                .where("id", "=", ctx.workflowId)
                .executeTakeFirst()

            if (!workflow)
                throw new TRPCError({ code: "NOT_FOUND" })

            return workflow
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
        .mutation(async ({ input, ctx }) => {
            return db.deleteFrom("workflows")
                .where("id", "=", input.workflowId)
                .returning("id")
                .executeTakeFirstOrThrow()
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
                        const result = await eventSourceDef.setup({
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
                        const result = await eventSourceDef.addEventTypes(existingSource, [input.triggerEventTypeId])

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
                .select(["graph", "last_save_client_timestamp", "last_edited_at"])
                .where("id", "=", ctx.workflowId)
                .executeTakeFirstOrThrow()

            const isAnOldUpdate = !!last_save_client_timestamp
                && last_save_client_timestamp.getTime() >= input.clientTimestamp.getTime()

            if (isAnOldUpdate)
                return oldWorkflow

            return db.updateTable("workflows")
                .set({
                    graph: input.graph,
                    last_edited_at: sql`now()`,
                    last_save_client_timestamp: input.clientTimestamp,
                })
                .where("id", "=", ctx.workflowId)
                .returning(["last_edited_at", "graph"])
                .executeTakeFirstOrThrow()
        }),




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
