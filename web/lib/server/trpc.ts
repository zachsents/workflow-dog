import { TRPCError, initTRPC } from "@trpc/server"
import { sql } from "kysely"
import { NextRequest } from "next/server"
import "server-only"
import type { ProjectPermission, Triggers } from "shared/db"
import { ZodError, z } from "zod"
import { Schemas } from "../iso/schemas"
import { db } from "./db"
import { getProjectBilling } from "./projects"
import { sendEmailFromTemplate } from "./resend"
import { supabaseServer } from "./supabase"


const t = initTRPC.context<Context>().create({
    errorFormatter: ({ shape, error }) => {
        const zodError = error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null
        const message = zodError
            ? [
                ...zodError.formErrors,
                ...Object.values(zodError.fieldErrors).flat().filter(Boolean),
            ].join(", ")
            : error.message

        return {
            ...shape,
            data: {
                ...shape.data,
                zodError,
                message,
            },
        }
    }
})

export const appRouter = t.router({
    projects: {
        list: t.procedure
            .query(async ({ ctx }) => {
                const userId = Assert.authenticated(ctx)

                const queryResult = await db.selectFrom("projects")
                    .fullJoin("projects_users", "projects.id", "project_id")
                    .fullJoin("auth.users", "auth.users.id", "user_id")
                    .selectAll("projects")
                    .select([
                        sql<string[]>`array_agg(user_id)`.as("member_ids"),
                        sql<string[]>`array_agg(auth.users.raw_user_meta_data->>name)`.as("member_names"),
                        sql<string[]>`array_agg(auth.users.email)`.as("member_emails"),
                    ])
                    .where("user_id", "=", userId)
                    .groupBy("projects.id")
                    .execute()

                const projects = queryResult.map(row => {
                    const { member_ids, member_names, member_emails, ...rest } = row
                    return {
                        ...rest,
                        members: member_ids.map((id, i) => ({
                            id,
                            name: member_names[i],
                            email: member_emails[i],
                        }))
                    }
                })

                return projects
            }),

        byId: t.procedure
            .input(z.object({ id: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)
                await Assert.userHasProjectPermission(userId, input.id, "read")

                const queryResult = await db.selectFrom("projects")
                    .selectAll()
                    .where("id", "=", input.id)
                    .executeTakeFirst()

                if (!queryResult)
                    throw new TRPCError({ code: "NOT_FOUND" })

                return queryResult
            }),

        create: t.procedure
            .input(z.object({
                name: z.string().min(1).max(120),
            }))
            .mutation(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)

                const newProject = await db.insertInto("projects")
                    .values({
                        name: input.name,
                        creator: userId,
                    })
                    .returning("id")
                    .executeTakeFirst()

                if (!newProject)
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })

                await db.insertInto("projects_users")
                    .values({
                        project_id: newProject.id,
                        user_id: userId,
                    })
                    .executeTakeFirst()

                return newProject
            }),

        updateSettings: t.procedure
            .input(z.object({
                id: z.string().uuid(),
                settings: Schemas.Projects.Settings,
            }))
            .mutation(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)
                await Assert.userHasProjectPermission(userId, input.id, "write")

                await db.updateTable("projects")
                    .set({
                        name: input.settings.name,
                    })
                    .where("id", "=", input.id)
                    .executeTakeFirstOrThrow()
            }),

        "delete": t.procedure
            .input(z.object({ id: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)
                await Assert.userHasProjectPermission(userId, input.id, "write")

                // to do: unregister triggers

                await db.deleteFrom("projects")
                    .where("id", "=", input.id)
                    .executeTakeFirst()
            }),

        billingInfo: t.procedure
            .input(z.object({ id: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)
                await Assert.userHasProjectPermission(userId, input.id, "read")

                return await getProjectBilling(input.id)
            }),

        members: {
            list: t.procedure
                .input(z.object({ projectId: z.string().uuid() }))
                .query(async ({ input, ctx }) => {
                    const userId = Assert.authenticated(ctx)
                    await Assert.userHasProjectPermission(userId, input.projectId, "read")

                    const queryResult = await db.selectFrom("projects_users")
                        .fullJoin("auth.users", "auth.users.id", "user_id")
                        .select([
                            "auth.users.id",
                            "auth.users.email",
                            sql<string>`auth.users.raw_user_meta_data->'name'`.as("name"),
                            "permissions",
                        ])
                        .where("project_id", "=", input.projectId)
                        .execute()

                    return queryResult
                }),

            invite: t.procedure
                .input(z.object({
                    projectId: z.string().uuid(),
                    email: z.string().email(),
                }))
                .mutation(async ({ input, ctx }) => {
                    const userId = Assert.authenticated(ctx)
                    await Assert.userHasProjectPermission(userId, input.projectId, "write")

                    const { already_on_team } = await db.selectNoFrom(({ exists, selectFrom }) => exists(
                        selectFrom("projects_users")
                            .leftJoin("auth.users", "auth.users.id", "user_id")
                            .where("project_id", "=", input.projectId)
                            .where("email", "=", input.email)
                    ).as("already_on_team")).executeTakeFirstOrThrow()

                    if (already_on_team)
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "User is already on the team",
                        })

                    const { already_invited } = await db.selectNoFrom(({ exists, selectFrom }) => exists(
                        selectFrom("project_invitations")
                            .where("project_id", "=", input.projectId)
                            .where("invitee_email", "=", input.email)
                    ).as("already_invited")).executeTakeFirstOrThrow()

                    if (already_invited)
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "User has already been invited",
                        })

                    const addInvitation = () => db.insertInto("project_invitations")
                        .values({
                            project_id: input.projectId,
                            invitee_email: input.email,
                        })
                        .returning("id")
                        .executeTakeFirstOrThrow()

                    const lookupProjectName = () => db.selectFrom("projects")
                        .select("name")
                        .where("id", "=", input.projectId)
                        .executeTakeFirstOrThrow()

                    const [
                        { id: invitationId },
                        { name: projectName }
                    ] = await Promise.all([
                        addInvitation(),
                        lookupProjectName(),
                    ])

                    await sendEmailFromTemplate("invite-member", {
                        invitationId,
                        projectName,
                    }, {
                        to: input.email,
                    })
                }),

            changePermissions: t.procedure
                .input(z.object({
                    projectId: z.string().uuid(),
                    memberId: z.string().uuid(),
                    addPermissions: Schemas.Projects.Permissions.array()
                        .optional()
                        .describe("Permissions to add"),
                    removePermissions: Schemas.Projects.Permissions.array()
                        .optional()
                        .describe("Permissions to remove"),
                    permissions: Schemas.Projects.Permissions.array()
                        .optional()
                        .describe("Overwrite permissions. When included, addPermissions and removePermissions are ignored."),
                }))
                .mutation(async ({ input, ctx }) => {
                    const userId = Assert.authenticated(ctx)
                    await Assert.userHasProjectPermission(userId, input.projectId, "write")

                    if (input.permissions) {
                        await db.updateTable("projects_users")
                            .set({
                                permissions: Array.from(new Set(input.permissions)),
                            })
                            .where("project_id", "=", input.projectId)
                            .where("user_id", "=", input.memberId)
                            .executeTakeFirstOrThrow()
                        return
                    }

                    const removeExpr = input.removePermissions?.length
                        ? sql.join(input.removePermissions)
                        : sql.raw("")
                    const addExpr = input.addPermissions?.length
                        ? sql.join(input.addPermissions)
                        : sql.raw("")

                    await db.updateTable("projects_users")
                        .set({
                            permissions: sql`(select array(select unnest(permissions) except select unnest(array[${removeExpr}]::project_permission[]) union select unnest(array[${addExpr}]::project_permission[])))`,
                        })
                        .where("project_id", "=", input.projectId)
                        .where("user_id", "=", input.memberId)
                        .executeTakeFirstOrThrow()
                }),

            remove: t.procedure
                .input(z.object({
                    projectId: z.string().uuid(),
                    memberId: z.string().uuid(),
                }))
                .mutation(async ({ input, ctx }) => {
                    const userId = Assert.authenticated(ctx)
                    await Assert.userHasProjectPermission(userId, input.projectId, "write")

                    await db.deleteFrom("projects_users")
                        .where("project_id", "=", input.projectId)
                        .where("user_id", "=", input.memberId)
                        .executeTakeFirst()
                }),
        },

        invitations: {
            list: t.procedure
                .input(z.object({ projectId: z.string().uuid() }))
                .query(async ({ input, ctx }) => {
                    const userId = Assert.authenticated(ctx)
                    await Assert.userHasProjectPermission(userId, input.projectId, "read")

                    const queryResult = await db.selectFrom("project_invitations")
                        .selectAll()
                        .where("project_id", "=", input.projectId)
                        .execute()

                    return queryResult
                }),

            cancel: t.procedure
                .input(z.object({
                    projectId: z.string().uuid(),
                    invitationId: z.string().uuid(),
                }))
                .mutation(async ({ input, ctx }) => {
                    const userId = Assert.authenticated(ctx)
                    await Assert.userHasProjectPermission(userId, input.projectId, "write")

                    await db.deleteFrom("project_invitations")
                        .where("id", "=", input.invitationId)
                        .executeTakeFirstOrThrow()
                }),
        }
    },
    workflows: {
        list: t.procedure
            .input(z.object({ projectId: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)
                await Assert.userHasProjectPermission(userId, input.projectId, "read")

                const queryResult = await db.selectFrom("workflows")
                    .leftJoin("triggers as t", "workflow_id", "workflows.id")
                    .selectAll("workflows")
                    .select(sql<Triggers[] | [null]>`json_agg(row_to_json(t))`.as("triggers"))
                    .where("project_id", "=", input.projectId)
                    .groupBy("workflows.id")
                    .execute()

                const expandedWorkflows = queryResult.map(row => ({
                    ...row,
                    triggers: row.triggers.filter(Boolean) as Triggers[],
                }))

                return expandedWorkflows
            }),

        setEnabled: t.procedure
            .input(z.object({
                workflowId: z.string().uuid(),
                isEnabled: z.boolean().optional()
            }))
            .mutation(async ({ input, ctx }) => {
                const userId = Assert.authenticated(ctx)
                await Assert.userHasProjectPermissionByWorkflowId(userId, input.workflowId, "write")

                await db.updateTable("workflows")
                    .set({
                        is_enabled: typeof input.isEnabled === "boolean"
                            ? input.isEnabled
                            : sql<boolean>`not is_enabled`
                    })
                    .where("id", "=", input.workflowId)
                    .executeTakeFirstOrThrow()
            })
    },
    users: {
        init: t.procedure
            .input(z.object({ id: z.string() }))
            .mutation(async () => {
                // validate admin

                // create customer in stripe
                // register with resend

                return {}
            })
    },
})


export async function createContext(req: NextRequest) {
    const supabase = supabaseServer()
    const session = await supabase.auth.getSession()
        .then(res => res.data.session)

    return {
        req,
        session,
        user: session?.user || null,
        db: supabase,
    }
}

type Context = Awaited<ReturnType<typeof createContext>>


const Assert = {
    authenticated(ctx: Context) {
        if (!ctx.user)
            throw new TRPCError({ code: "UNAUTHORIZED" })
        return ctx.user.id
    },

    async userHasProjectPermission(userId: string, projectId: string, permission: ProjectPermission) {
        const queryResult = await db.selectFrom("projects_users")
            .select(sql<boolean>`${permission} = any(permissions)`.as("has_permission"))
            .where("user_id", "=", userId)
            .where("project_id", "=", projectId)
            .execute()

        if (queryResult.length > 0 && queryResult[0].has_permission)
            return true

        throw new TRPCError({ code: "FORBIDDEN" })
    },

    async userHasProjectPermissionByWorkflowId(userId: string, workflowId: string, permission: ProjectPermission) {
        const queryResult = await db.selectFrom("projects_users")
            .select(sql<boolean>`${permission} = any(permissions)`.as("has_permission"))
            .where("user_id", "=", userId)
            .where(({ eb, selectFrom }) => eb(
                "project_id",
                "=",
                selectFrom("workflows")
                    .select("project_id")
                    .where("id", "=", workflowId)
            ))
            .execute()

        if (queryResult.length > 0 && queryResult[0].has_permission)
            return true

        throw new TRPCError({ code: "FORBIDDEN" })
    }
}
