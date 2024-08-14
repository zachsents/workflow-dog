import { TRPCError } from "@trpc/server"
import type { ProjectPermission, Triggers, WorkflowGraphs } from "core/db"
import { WORKFLOW_NAME_SCHEMA } from "core/schemas"
import { type Selectable, sql } from "kysely"
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
                .selectAll()
                .where("project_id", "=", ctx.projectId)
                .execute()
        }),

    byId: projectPermissionByWorkflowProcedure("read")
        .query(async ({ ctx }) => {
            const [workflow, triggers] = await Promise.all([
                db.selectFrom("workflows")
                    .leftJoin("workflow_graphs as wg", "current_graph_id", "wg.id")
                    .selectAll("workflows")
                    .select(sql<Selectable<WorkflowGraphs>>`row_to_json(wg)`.as("current_graph"))
                    .where("workflows.id", "=", ctx.workflowId)
                    .executeTakeFirst(),
                // wilo: fixing this // 
                db.selectFrom("triggers")
                    .selectAll()
                    .where("workflow_id", "=", ctx.workflowId)
                    .execute()
            ])

            if (!workflow)
                throw new TRPCError({ code: "NOT_FOUND" })

            return { ...workflow, triggers }
        }),

    // listRunnable: projectPermissionProcedure("read")
    // .query(async ({ ctx }) => {

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

                const newGraph = await trx.insertInto("workflow_graphs")
                    .values({ workflow_id: newWorkflow.id })
                    .returning("id")
                    .executeTakeFirstOrThrow()

                await trx.updateTable("workflows")
                    .set({ current_graph_id: newGraph.id })
                    .where("id", "=", newWorkflow.id)
                    .executeTakeFirstOrThrow()

                return newWorkflow
            })
        }),

    // updateGraph: t.procedure
    //     .input(z.object({
    //         workflowId: z.string().uuid(),
    //         graph: z.object({
    //             nodes: z.any().array(),
    //             edges: z.any().array(),
    //         }),
    //     }))
    //     .mutation(async ({ input, ctx }) => {
    //         assertAuthenticated(ctx)
    //         assert(
    //             await userHasProjectPermission(ctx.userId!, "write")
    //                 .byWorkflowId(input.workflowId),
    //             forbidden()
    //         )

    //         await db.transaction().execute(trx => Promise.all([
    //             trx.updateTable("workflow_graphs")
    //                 .set({
    //                     nodes: JSON.stringify(input.graph.nodes),
    //                     edges: JSON.stringify(input.graph.edges),
    //                 })
    //                 .where(
    //                     "id", "=",
    //                     eb => eb.selectFrom("workflows")
    //                         .select("current_graph_id")
    //                         .where("id", "=", input.workflowId)
    //                 )
    //                 .executeTakeFirstOrThrow(),

    //             trx.updateTable("workflows")
    //                 .set({ last_edited_at: new Date() })
    //                 .where("id", "=", input.workflowId)
    //                 .executeTakeFirstOrThrow()
    //         ]))
    //     }),

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
