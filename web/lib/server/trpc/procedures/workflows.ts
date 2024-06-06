import ManualTrigger from "@pkg/data/triggers/basic/manual.shared"
import { TriggerDefinitions } from "@pkg/server"
import { TRPCError } from "@trpc/server"
import { Schemas } from "@web/lib/iso/schemas"
import { mergeObjectsOverwriteArrays } from "@web/lib/iso/utils"
import assert from "assert"
import { Insertable, Selectable, sql } from "kysely"
import _ from "lodash"
import type { Triggers, WorkflowGraphs } from "shared/db"
import { z } from "zod"
import { userHasProjectPermission } from "../../auth-checks"
import { db } from "../../db"
import { WorkflowRunLimitExceededError, enrichWorkflowRunRow, queueWorkflow } from "../../internal"
import { assertAuthenticated, forbidden } from "../assertions"
import { t } from "../trpc"


export default {
    list: t.procedure
        .input(z.object({
            projectId: z.string().uuid(),
            onlyRunnable: z.boolean().optional(),
        }))
        .query(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "read")
                    .byProjectId(input.projectId),
                forbidden()
            )

            let query = db.selectFrom("workflows")
                .leftJoin("triggers as t", "workflow_id", "workflows.id")
                .selectAll("workflows")
                .select(
                    sql<Selectable<Triggers>[]>`coalesce(jsonb_agg(t) filter (where t.id is not null), '[]')`
                        .as("triggers")
                )
                .where("project_id", "=", input.projectId)

            if (input.onlyRunnable)
                query = query.where("t.def_id", "=", ManualTrigger.id)

            query = query.groupBy("workflows.id")

            return await query.execute()
        }),

    byId: t.procedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "read")
                    .byWorkflowId(input.id),
                forbidden()
            )

            const [workflow, triggers] = await Promise.all([
                db.selectFrom("workflows")
                    .leftJoin("workflow_graphs as wg", "current_graph_id", "wg.id")
                    .selectAll("workflows")
                    .select(sql<Selectable<WorkflowGraphs>>`row_to_json(wg)`.as("current_graph"))
                    .where("workflows.id", "=", input.id)
                    .executeTakeFirst(),
                db.selectFrom("triggers")
                    .selectAll()
                    .where("workflow_id", "=", input.id)
                    .execute()
            ])

            if (!workflow)
                throw new TRPCError({ code: "NOT_FOUND" })

            return { ...workflow, triggers }
        }),

    setEnabled: t.procedure
        .input(z.object({
            workflowId: z.string().uuid(),
            isEnabled: z.boolean().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "write")
                    .byWorkflowId(input.workflowId),
                forbidden()
            )

            await db.updateTable("workflows")
                .set({
                    is_enabled: typeof input.isEnabled === "boolean"
                        ? input.isEnabled
                        : sql<boolean>`not is_enabled`
                })
                .where("id", "=", input.workflowId)
                .executeTakeFirstOrThrow()
        }),

    rename: t.procedure
        .input(z.object({
            workflowId: z.string().uuid(),
            name: Schemas.Workflows.Name,
        }))
        .mutation(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "write")
                    .byWorkflowId(input.workflowId),
                forbidden()
            )

            await db.updateTable("workflows")
                .set({
                    name: input.name,
                })
                .where("id", "=", input.workflowId)
                .executeTakeFirstOrThrow()
        }),

    "delete": t.procedure
        .input(z.object({
            workflowId: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "write")
                    .byWorkflowId(input.workflowId),
                forbidden()
            )

            await db.deleteFrom("workflows")
                .where("id", "=", input.workflowId)
                .executeTakeFirstOrThrow()
        }),

    create: t.procedure
        .input(z.object({
            projectId: z.string().uuid(),
            name: Schemas.Workflows.Name,
        }))
        .mutation(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "write")
                    .byProjectId(input.projectId),
                forbidden()
            )

            const newWorkflow = await db.transaction().execute(async trx => {
                const newWorkflow = await trx.insertInto("workflows")
                    .values({
                        name: input.name,
                        creator: ctx.userId!,
                        project_id: input.projectId,
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

            return newWorkflow
        }),

    updateGraph: t.procedure
        .input(z.object({
            workflowId: z.string().uuid(),
            graph: z.object({
                nodes: z.any().array(),
                edges: z.any().array(),
            }),
        }))
        .mutation(async ({ input, ctx }) => {
            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "write")
                    .byWorkflowId(input.workflowId),
                forbidden()
            )

            await db.transaction().execute(trx => Promise.all([
                trx.updateTable("workflow_graphs")
                    .set({
                        nodes: JSON.stringify(input.graph.nodes),
                        edges: JSON.stringify(input.graph.edges),
                    })
                    .where(
                        "id", "=",
                        eb => eb.selectFrom("workflows")
                            .select("current_graph_id")
                            .where("id", "=", input.workflowId)
                    )
                    .executeTakeFirstOrThrow(),

                trx.updateTable("workflows")
                    .set({ last_edited_at: new Date() })
                    .where("id", "=", input.workflowId)
                    .executeTakeFirstOrThrow()
            ]))
        }),

    runManually: t.procedure
        .input(z.object({
            workflowId: z.string().uuid(),
            copyTriggerDataFrom: z.string().uuid().optional(),
            scheduledFor: z.date().optional(),
            triggerData: z.any(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { workflowId, ...queueOptions } = input

            assertAuthenticated(ctx)
            assert(
                await userHasProjectPermission(ctx.userId!, "write")
                    .byWorkflowId(input.workflowId),
                forbidden()
            )

            const newRunId = await queueWorkflow(workflowId, {
                ...queueOptions,
                triggerData: queueOptions.triggerData ?? null,
            }).catch(err => {
                if (err instanceof WorkflowRunLimitExceededError)
                    throw err.toTRPC()
                else throw err
            })

            return newRunId
        }),

    runs: {
        list: t.procedure
            .input(z.object({ workflowId: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                assertAuthenticated(ctx)
                assert(
                    await userHasProjectPermission(ctx.userId!, "read")
                        .byWorkflowId(input.workflowId),
                    forbidden()
                )

                const queryResult = await db.selectFrom("workflow_runs")
                    .selectAll()
                    .where("workflow_id", "=", input.workflowId)
                    .orderBy("created_at", "desc")
                    .limit(100)
                    .execute()

                return queryResult.map(enrichWorkflowRunRow)
            }),

        mostRecent: t.procedure
            .input(z.object({ workflowId: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                assertAuthenticated(ctx)
                assert(
                    await userHasProjectPermission(ctx.userId!, "read")
                        .byWorkflowId(input.workflowId),
                    forbidden()
                )

                const queryResult = await db.selectFrom("workflow_runs")
                    .selectAll()
                    .where("workflow_id", "=", input.workflowId)
                    .orderBy("created_at", "desc")
                    .limit(1)
                    .executeTakeFirst()

                return queryResult
                    ? enrichWorkflowRunRow(queryResult)
                    : null
            }),

        byId: t.procedure
            .input(z.object({ id: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                assertAuthenticated(ctx)
                assert(
                    await userHasProjectPermission(ctx.userId!, "read")
                        .byWorkflowRunId(input.id),
                    forbidden()
                )

                const queryResult = await db.selectFrom("workflow_runs")
                    .selectAll()
                    .where("id", "=", input.id)
                    .executeTakeFirst()

                if (!queryResult)
                    throw new TRPCError({ code: "NOT_FOUND" })

                return queryResult
            }),
    },

    triggers: {
        update: t.procedure
            .input(z.object({
                triggerId: z.string().uuid(),
                config: z.object({}).passthrough().optional(),
                serviceAccountId: z.string().uuid().optional(),
            }))
            .mutation(async ({ input, ctx }) => {
                assertAuthenticated(ctx)
                assert(
                    await userHasProjectPermission(ctx.userId!, "write")
                        .byTriggerId(input.triggerId),
                    forbidden()
                )

                const oldTrigger = await db.selectFrom("triggers")
                    .selectAll()
                    .where("id", "=", input.triggerId)
                    .executeTakeFirstOrThrow()

                const newConfig = mergeObjectsOverwriteArrays(
                    oldTrigger.config as Record<string, any>,
                    input.config || {},
                )

                const shouldUpdate = !_.isEqual(oldTrigger.config, newConfig)
                    || oldTrigger.service_account_id != input.serviceAccountId

                if (!shouldUpdate)
                    return

                const triggerDefinition = TriggerDefinitions.get(oldTrigger.def_id)
                if (!triggerDefinition)
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: `Couldn't find definition for trigger def id: ${oldTrigger.def_id}`,
                    })

                const newTrigger = {
                    ...oldTrigger,
                    config: newConfig,
                    ...input.serviceAccountId && {
                        service_account_id: input.serviceAccountId
                    },
                } satisfies typeof oldTrigger

                const newTriggerState = await triggerDefinition.onChange?.(oldTrigger, newTrigger)

                await db.updateTable("triggers")
                    .set({
                        config: newConfig,
                        service_account_id: newTrigger.service_account_id,
                        state: mergeObjectsOverwriteArrays(
                            oldTrigger.state as Record<string, any>,
                            newTriggerState || {},
                        ),
                    })
                    .execute()
            }),

        assignNew: t.procedure
            .input(z.object({
                workflowId: z.string().uuid(),
                definitionId: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                assertAuthenticated(ctx)
                assert(
                    await userHasProjectPermission(ctx.userId!, "write")
                        .byWorkflowId(input.workflowId),
                    forbidden()
                )

                const oldTrigger = await db.selectFrom("triggers")
                    .selectAll()
                    .where("workflow_id", "=", input.workflowId)
                    .executeTakeFirst()

                const newTrigger: Insertable<Triggers> = {
                    config: {},
                    service_account_id: null,
                    workflow_id: input.workflowId,
                    def_id: input.definitionId,
                }

                const oldDefinition = oldTrigger?.def_id
                    ? TriggerDefinitions.get(oldTrigger?.def_id)
                    : undefined
                const newDefinition = TriggerDefinitions.get(input.definitionId)

                // call onChange handlers in parallel
                const [, newState] = await Promise.all([
                    oldTrigger
                        ? oldDefinition?.onChange?.(oldTrigger, null)
                        : Promise.resolve(null),
                    newTrigger
                        ? newDefinition?.onChange?.(null, newTrigger)
                        : Promise.resolve(null),
                ])

                await db.transaction().execute(async trx => {
                    await trx.deleteFrom("triggers")
                        .where("workflow_id", "=", input.workflowId)
                        .execute()

                    await trx.insertInto("triggers")
                        .values({
                            ...newTrigger,
                            state: newState || {},
                        })
                        .execute()
                })

                return newTrigger
            }),
    },
}

