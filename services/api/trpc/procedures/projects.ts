import { TRPCError } from "@trpc/server"
import type { ProjectPermission } from "core/db"
import { PROJECT_NAME_SCHEMA } from "core/schemas"
import { sql } from "kysely"
import { z } from "zod"
import { authenticatedProcedure } from ".."
import { userHasProjectPermission } from "../../lib/auth-checks"
import { db } from "../../lib/db"
import { assertOrForbidden } from "../assertions"


export default {
    list: authenticatedProcedure
        .query(async ({ ctx }) => {
            const queryResult = await db.selectFrom("projects")
                .fullJoin("projects_users", "projects.id", "project_id")
                .fullJoin("user_meta", "user_meta.id", "user_id")
                .selectAll("projects")
                .select([
                    sql<string[]>`array_agg(user_id)`.as("member_ids"),
                    sql<string[]>`array_agg(user_meta.name)`.as("member_names"),
                ])
                .where("user_id", "=", ctx.user.id)
                .groupBy("projects.id")
                .orderBy("projects.created_at", "desc")
                .execute()

            const projects = queryResult.map(row => {
                const { member_ids, member_names, ...rest } = row
                return {
                    ...rest,
                    members: member_ids.map((id, i) => ({
                        id,
                        name: member_names[i],
                    }))
                }
            })

            return projects
        }),

    byId: projectPermissionProcedure("read")
        .query(async ({ ctx }) => {
            const queryResult = await db.selectFrom("projects")
                .selectAll()
                .where("id", "=", ctx.projectId)
                .executeTakeFirst()

            if (!queryResult)
                throw new TRPCError({ code: "NOT_FOUND" })

            return queryResult
        }),

    overview: projectPermissionProcedure("read")
        .input(z.object({
            timezone: z.string().refine(tz => Intl.supportedValuesOf("timeZone").includes(tz)),
            historyLength: z.number().min(1).max(30).default(7),
        }))
        .query(async ({ ctx, input }) => {
            /*
             * Postgres returns bigint for count fn, so it gets cast to string
             * @see https://stackoverflow.com/questions/47843370/postgres-sequelize-raw-query-to-get-count-returns-string-value
             */

            const [workflowCount, memberCount, recentRunResults] = await Promise.all([
                db.selectFrom("workflows")
                    .select(({ fn }) => [fn.countAll<string>().as("count")])
                    .where("project_id", "=", ctx.projectId)
                    .executeTakeFirstOrThrow()
                    .then(r => parseInt(r.count)),

                db.selectFrom("projects_users")
                    .select(({ fn }) => [fn.countAll<string>().as("count")])
                    .where("project_id", "=", ctx.projectId)
                    .executeTakeFirstOrThrow()
                    .then(r => parseInt(r.count)),

                sql<{ date: Date, error: string, success: string }>`
                WITH date_bins AS (
                    SELECT 
                        daterange(
                            (now() at time zone ${input.timezone} - make_interval(days => _offset))::date, 
                            (now() at time zone ${input.timezone} - make_interval(days => _offset - 1))::date
                        ) as date_bin
                    FROM (SELECT generate_series(0, ${input.historyLength - 1}) as _offset)
                )
                SELECT 
                    lower(date_bin)::timestamp at time zone ${input.timezone} as date,
                    sum(_error) as error,
                    sum(_success) as success
                FROM date_bins
                LEFT JOIN workflow_runs ON date_bin @> (workflow_runs.started_at at time zone ${input.timezone})::date
                LEFT JOIN LATERAL (
                    SELECT 
                        (id is not null and (count(node_error_keys) > 0 or global_error is not null))::int as _error,
                        (id is not null and count(node_error_keys) = 0 and global_error is null)::int as _success
                    FROM jsonb_object_keys(node_errors) as node_error_keys
                ) ON true
                GROUP BY date_bin
                ORDER BY date_bin;
                `.execute(db).then(r => r.rows.map(row => ({
                    ...row,
                    error: parseInt(row.error),
                    success: parseInt(row.success),
                }))),
            ])

            return {
                workflowCount,
                memberCount,
                recentRunResults,
            }
        }),

    create: authenticatedProcedure
        .input(z.object({ name: PROJECT_NAME_SCHEMA }))
        .mutation(async ({ input, ctx }) => db.transaction().execute(async trx => {
            const newProject = await trx.insertInto("projects")
                .values({
                    name: input.name,
                    creator: ctx.user.id,
                })
                .returning("id")
                .executeTakeFirstOrThrow()

            await trx.insertInto("projects_users")
                .values({
                    project_id: newProject.id,
                    user_id: ctx.user.id,
                })
                .executeTakeFirst()

            return newProject
        })),

    rename: projectPermissionProcedure("write")
        .input(z.object({ name: PROJECT_NAME_SCHEMA }))
        .mutation(async ({ input, ctx }) => {
            await db.updateTable("projects")
                .set({ name: input.name })
                .where("id", "=", ctx.projectId)
                .executeTakeFirstOrThrow()
        }),

    delete: projectPermissionProcedure("write")
        .mutation(async ({ ctx }) => {
            await db.deleteFrom("projects")
                .where("id", "=", ctx.projectId)
                .executeTakeFirstOrThrow()

            return { success: true, projectId: ctx.projectId }
        }),

    // updateSettings: t.procedure
    //     .input(z.object({
    //         id: z.string().uuid(),
    //         settings: Schemas.Projects.Settings,
    //     }))
    //     .mutation(async ({ input, ctx }) => {
    //         assertAuthenticated(ctx)
    //         assert(
    //             await userHasProjectPermission(ctx.user.id, "write")
    //                 .byProjectId(input.id),
    //             forbidden()
    //         )

    //         await db.updateTable("projects")
    //             .set({
    //                 name: input.settings.name,
    //             })
    //             .where("id", "=", input.id)
    //             .executeTakeFirstOrThrow()
    //     }),

    // "delete": t.procedure
    //     .input(z.object({ id: z.string().uuid() }))
    //     .mutation(async ({ input, ctx }) => {
    //         assertAuthenticated(ctx)
    //         assert(
    //             await userHasProjectPermission(ctx.user.id, "write")
    //                 .byProjectId(input.id),
    //             forbidden()
    //         )

    //         // to do: unregister triggers

    //         await db.deleteFrom("projects")
    //             .where("id", "=", input.id)
    //             .executeTakeFirst()
    //     }),

    // members: t.router({
    //     list: t.procedure
    //         .input(z.object({ projectId: z.string().uuid() }))
    //         .query(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.user.id, "read")
    //                     .byProjectId(input.projectId),
    //                 forbidden()
    //             )

    //             const queryResult = await db.selectFrom("projects_users")
    //                 .fullJoin("auth.users", "auth.users.id", "user_id")
    //                 .select([
    //                     "auth.users.id",
    //                     "auth.users.email",
    //                     "auth.users.name",
    //                     "permissions",
    //                 ])
    //                 .where("project_id", "=", input.projectId)
    //                 .execute()

    //             return queryResult
    //         }),

    //     invite: t.procedure
    //         .input(z.object({
    //             projectId: z.string().uuid(),
    //             email: z.string().email(),
    //         }))
    //         .mutation(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.user.id, "write")
    //                     .byProjectId(input.projectId),
    //                 forbidden()
    //             )

    //             await Promise.race([
    //                 // User is already on team
    //                 db
    //                     .selectNoFrom(({ exists, selectFrom }) => exists(
    //                         selectFrom("projects_users")
    //                             .leftJoin("auth.users", "auth.users.id", "user_id")
    //                             .where("project_id", "=", input.projectId)
    //                             .where("email", "=", input.email)
    //                     ).as("already_on_team"))
    //                     .executeTakeFirstOrThrow()
    //                     .then(r => {
    //                         if (r.already_on_team)
    //                             throw new TRPCError({
    //                                 code: "CONFLICT",
    //                                 message: "User is already on the team",
    //                             })
    //                     }),
    //                 // User is already invited to team
    //                 db
    //                     .selectNoFrom(({ exists, selectFrom }) => exists(
    //                         selectFrom("project_invitations")
    //                             .where("project_id", "=", input.projectId)
    //                             .where("invitee_email", "=", input.email)
    //                     ).as("already_invited"))
    //                     .executeTakeFirstOrThrow()
    //                     .then(r => {
    //                         if (r.already_invited)
    //                             throw new TRPCError({
    //                                 code: "CONFLICT",
    //                                 message: "User has already been invited",
    //                             })
    //                     }),
    //                 // Project limit exceeded
    //                 (async () => {
    //                     const billingInfo = await getProjectBilling(input.projectId)
    //                     const memberCount = await countProjectMembers(input.projectId)
    //                     if (memberCount >= billingInfo.limits.teamMembers)
    //                         throw new TRPCError({
    //                             code: "TOO_MANY_REQUESTS",
    //                             message: `Plan limit exceeded. Your plan only allows ${billingInfo.limits.teamMembers} members.`,
    //                         })
    //                 })()
    //             ])

    //             const addInvitation = () => db.insertInto("project_invitations")
    //                 .values({
    //                     project_id: input.projectId,
    //                     invitee_email: input.email,
    //                 })
    //                 .returning("id")
    //                 .executeTakeFirstOrThrow()

    //             const lookupProjectName = () => db.selectFrom("projects")
    //                 .select("name")
    //                 .where("id", "=", input.projectId)
    //                 .executeTakeFirstOrThrow()

    //             const [
    //                 { id: invitationId },
    //                 { name: projectName },
    //             ] = await Promise.all([
    //                 addInvitation(),
    //                 lookupProjectName(),
    //             ])

    //             await sendEmailFromTemplate("invite-member", {
    //                 invitationId,
    //                 projectName,
    //             }, {
    //                 to: input.email,
    //             })
    //         }),

    //     changePermissions: t.procedure
    //         .input(z.object({
    //             projectId: z.string().uuid(),
    //             memberId: z.string().uuid(),
    //             addPermissions: Schemas.Projects.Permissions.array()
    //                 .optional()
    //                 .describe("Permissions to add"),
    //             removePermissions: Schemas.Projects.Permissions.array()
    //                 .optional()
    //                 .describe("Permissions to remove"),
    //             permissions: Schemas.Projects.Permissions.array()
    //                 .optional()
    //                 .describe("Overwrite permissions. When included, addPermissions and removePermissions are ignored."),
    //         }))
    //         .mutation(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.user.id, "write")
    //                     .byProjectId(input.projectId),
    //                 forbidden()
    //             )

    //             if (input.permissions) {
    //                 await db.updateTable("projects_users")
    //                     .set({
    //                         permissions: Array.from(new Set(input.permissions)),
    //                     })
    //                     .where("project_id", "=", input.projectId)
    //                     .where("user_id", "=", input.memberId)
    //                     .executeTakeFirstOrThrow()
    //                 return
    //             }

    //             const removeExpr = input.removePermissions?.length
    //                 ? sql.join(input.removePermissions)
    //                 : sql.raw("")
    //             const addExpr = input.addPermissions?.length
    //                 ? sql.join(input.addPermissions)
    //                 : sql.raw("")

    //             await db.updateTable("projects_users")
    //                 .set({
    //                     permissions: sql`(select array(select unnest(permissions) except select unnest(array[${removeExpr}]::project_permission[]) union select unnest(array[${addExpr}]::project_permission[])))`,
    //                 })
    //                 .where("project_id", "=", input.projectId)
    //                 .where("user_id", "=", input.memberId)
    //                 .executeTakeFirstOrThrow()
    //         }),

    //     remove: t.procedure
    //         .input(z.object({
    //             projectId: z.string().uuid(),
    //             memberId: z.string().uuid(),
    //         }))
    //         .mutation(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.user.id, "write")
    //                     .byProjectId(input.projectId),
    //                 forbidden()
    //             )

    //             await db.deleteFrom("projects_users")
    //                 .where("project_id", "=", input.projectId)
    //                 .where("user_id", "=", input.memberId)
    //                 .executeTakeFirst()
    //         }),
    // }),

    // invitations: t.router({
    //     list: t.procedure
    //         .input(z.object({ projectId: z.string().uuid() }))
    //         .query(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.user.id, "read")
    //                     .byProjectId(input.projectId),
    //                 forbidden()
    //             )

    //             const queryResult = await db.selectFrom("project_invitations")
    //                 .selectAll()
    //                 .where("project_id", "=", input.projectId)
    //                 .execute()

    //             return queryResult
    //         }),

    //     cancel: t.procedure
    //         .input(z.object({
    //             projectId: z.string().uuid(),
    //             invitationId: z.string().uuid(),
    //         }))
    //         .mutation(async ({ input, ctx }) => {
    //             assertAuthenticated(ctx)
    //             assert(
    //                 await userHasProjectPermission(ctx.user.id, "write")
    //                     .byProjectId(input.projectId),
    //                 forbidden()
    //             )

    //             await db.deleteFrom("project_invitations")
    //                 .where("id", "=", input.invitationId)
    //                 .executeTakeFirstOrThrow()
    //         }),
    // })
}


export function projectPermissionProcedure(permission: ProjectPermission) {
    return authenticatedProcedure
        .input(z.object({ projectId: z.string().uuid() }))
        .use(async ({ ctx, input, next }) => {
            const hasPermission = await userHasProjectPermission(ctx.user.id, permission)
                .byProjectId(input.projectId)
            assertOrForbidden(hasPermission)
            return next({
                ctx: {
                    ...ctx,
                    projectId: input.projectId,
                    projectPermission: permission,
                }
            })
        })
}
