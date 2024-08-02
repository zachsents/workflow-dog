import { z } from "zod"
import { authenticatedProcedure } from ".."
import { db } from "../../lib/db"
import { sql } from "kysely"
import assert from "node:assert"
import { userHasProjectPermission } from "../../lib/auth-checks"
import { forbidden } from "../assertions"
import { TRPCError } from "@trpc/server"


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

    byId: authenticatedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            assert(
                await userHasProjectPermission(ctx.user.id, "read")
                    .byProjectId(input.id),
                forbidden()
            )

            const queryResult = await db.selectFrom("projects")
                .selectAll()
                .where("id", "=", input.id)
                .executeTakeFirst()

            if (!queryResult)
                throw new TRPCError({ code: "NOT_FOUND" })

            return queryResult
        }),

    create: authenticatedProcedure
        .input(z.object({
            name: z.string().min(1).max(120),
        }))
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