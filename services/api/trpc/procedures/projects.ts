import { TRPCError } from "@trpc/server"
import type { ProjectPermission } from "core/db"
import { PROJECT_NAME_SCHEMA } from "core/schemas"
import { sql } from "kysely"
import { z } from "zod"
import { authenticatedProcedure } from ".."
import { userHasProjectPermission } from "../../lib/auth-checks"
import { db } from "../../lib/db"
import { cleanupEventSourcesForWorkflow } from "../../lib/internal/event-sources"
import { createProject, getCurrentBillingPeriod } from "../../lib/internal/projects"
import { isProjectUnderTeamLimit } from "../../lib/internal/team"
import { sendEmailFromTemplate } from "../../lib/resend"
import { assertOrForbidden } from "../assertions"
import { stripe, STRIPE_PORTAL_CONFIG_KEY } from "../../lib/stripe"
import { useEnvVar } from "../../lib/utils"


export default {
    list: authenticatedProcedure
        .query(async ({ ctx }) => {
            const queryResult = await db.selectFrom("projects")
                .innerJoin("projects_users", "projects.id", "project_id")
                .innerJoin("user_meta", "user_meta.id", "user_id")
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
                .innerJoin("projects_users", "projects.id", "projects_users.project_id")
                .selectAll("projects")
                .select(sql<string[]>`permissions::text[]`.as("your_permissions"))
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

            const [workflowCount, memberCount, recentRunResults, memberPictures] = await Promise.all([
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
                    COALESCE(sum((error_count > 0)::int), 0) as error,
                    COALESCE(sum((error_count = 0)::int), 0) as success
                FROM date_bins
                LEFT JOIN LATERAL (
                    SELECT * FROM workflow_runs
                    WHERE
                        project_id = ${ctx.projectId} AND
                        date_bin @> (started_at at time zone ${input.timezone})::date
                ) runs ON true
                GROUP BY date_bin
                ORDER BY date_bin;
                `.execute(db).then(r => r.rows.map(row => ({
                    ...row,
                    error: parseInt(row.error),
                    success: parseInt(row.success),
                }))),

                db.selectFrom("projects_users")
                    .innerJoin("user_meta", "user_meta.id", "projects_users.user_id")
                    .select("picture")
                    .where("project_id", "=", ctx.projectId)
                    .orderBy(sql<boolean>`user_id = ${ctx.user.id}`, "desc")
                    .limit(5)
                    .execute()
                    .then(r => r.map(row => row.picture)),
            ])

            return {
                workflowCount,
                memberCount,
                recentRunResults,
                memberPictures,
            }
        }),

    create: authenticatedProcedure
        .input(z.object({ name: PROJECT_NAME_SCHEMA }))
        .mutation(async ({ input, ctx }) => db.transaction().execute(async trx => {
            return createProject({
                name: input.name,
                creator: ctx.user.id,
            }, {
                dbHandle: trx,
            })
        })),

    rename: projectPermissionProcedure("write")
        .input(z.object({ name: PROJECT_NAME_SCHEMA }))
        .mutation(async ({ input, ctx }) => {
            const project = await db.updateTable("projects")
                .set({ name: input.name })
                .where("id", "=", ctx.projectId)
                .returning(["stripe_customer_id", "stripe_subscription_id", "name"])
                .executeTakeFirstOrThrow()

            await Promise.all([
                project.stripe_customer_id
                    ? stripe.customers.update(project.stripe_customer_id, {
                        description: `Project "${project.name}"`,
                    })
                    : null,
                project.stripe_subscription_id
                    ? stripe.subscriptions.update(project.stripe_subscription_id, {
                        description: `Subscription for Project "${project.name}"`,
                    })
                    : null,
            ])
        }),

    delete: projectPermissionProcedure("write")
        .mutation(async ({ ctx }) => {
            return db.transaction().execute(async trx => {

                async function deleteWorkflows() {
                    const workflows = await trx.selectFrom("workflows")
                        .select("id")
                        .where("project_id", "=", ctx.projectId)
                        .execute()

                    await Promise.all(workflows.map(wf =>
                        cleanupEventSourcesForWorkflow(wf.id, {
                            dbHandle: trx,
                        })
                    ))
                }

                async function deleteStripeObjects() {
                    const { stripe_customer_id } = await trx.selectFrom("projects")
                        .select("stripe_customer_id")
                        .where("id", "=", ctx.projectId)
                        .executeTakeFirstOrThrow()

                    if (stripe_customer_id)
                        await stripe.customers.del(stripe_customer_id)
                }

                await Promise.all([deleteWorkflows(), deleteStripeObjects()])

                return trx.deleteFrom("projects")
                    .where("id", "=", ctx.projectId)
                    .returning("id")
                    .executeTakeFirstOrThrow()
            })
        }),

    team: {
        list: projectPermissionProcedure("read")
            .query(async ({ ctx, input }) => {
                return db.selectFrom("projects_users")
                    .innerJoin("user_meta", "user_meta.id", "user_id")
                    .selectAll("user_meta")
                    .select(sql<string[]>`projects_users.permissions::text[]`.as("permissions"))
                    .where("project_id", "=", ctx.projectId)
                    .execute()
                    .then(r => r.map(row => ({
                        ...row,
                        isYou: row.id === ctx.user.id,
                        isEditor: row.permissions.includes("write"),
                        isInvited: false,
                    })))
            }),

        canInviteMembers: projectPermissionProcedure("read")
            .query(async ({ ctx }) => isProjectUnderTeamLimit(ctx.projectId)),

        remove: projectPermissionProcedure("write")
            .input(z.object({ userId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                return db.deleteFrom("projects_users")
                    .where("project_id", "=", ctx.projectId)
                    .where("user_id", "=", input.userId)
                    .returning("user_id")
                    .executeTakeFirstOrThrow()
            }),

        setRole: projectPermissionProcedure("write")
            .input(z.object({
                userId: z.string().uuid(),
                role: z.enum(["editor", "viewer"]),
            }))
            .mutation(async ({ input, ctx }) => {
                await db.updateTable("projects_users")
                    .set({
                        permissions: input.role === "viewer"
                            ? ["read"]
                            : ["read", "write"],
                    })
                    .where("project_id", "=", ctx.projectId)
                    .where("user_id", "=", input.userId)
                    .executeTakeFirstOrThrow()
            }),

        invite: projectPermissionProcedure("write")
            .input(z.object({
                email: z.string().email(),
            }))
            .mutation(async ({ input, ctx }) => {
                await Promise.all([
                    // User is already on team
                    db.selectNoFrom(eb => eb.exists(eb.selectFrom("projects_users")
                        .innerJoin("user_meta", "user_meta.id", "projects_users.user_id")
                        .where("project_id", "=", ctx.projectId)
                        .where("email", "=", input.email)
                    ).as("already_on_team")).executeTakeFirstOrThrow().then(r => {
                        if (r.already_on_team)
                            throw new TRPCError({
                                code: "CONFLICT",
                                message: "User is already on the team",
                            })
                    }),
                    // User is already invited to team
                    db.selectNoFrom(eb => eb.exists(eb.selectFrom("project_invitations")
                        .where("project_id", "=", ctx.projectId)
                        .where("invitee_email", "=", input.email)
                    ).as("already_invited")).executeTakeFirstOrThrow().then(r => {
                        if (r.already_invited)
                            throw new TRPCError({
                                code: "CONFLICT",
                                message: "User has already been invited",
                            })
                    }),
                    // Project limit exceeded
                    isProjectUnderTeamLimit(ctx.projectId).then(underLimit => {
                        if (!underLimit)
                            throw new TRPCError({
                                code: "TOO_MANY_REQUESTS",
                                message: `Team member limit for your plan has been reached.`,
                            })
                    }),
                ])

                const [invitationId, projectName, inviterEmail] = await Promise.all([
                    db.insertInto("project_invitations")
                        .values({
                            project_id: input.projectId,
                            invitee_email: input.email,
                        })
                        .returning("id")
                        .executeTakeFirstOrThrow()
                        .then(r => r.id),
                    db.selectFrom("projects")
                        .select("name")
                        .where("id", "=", input.projectId)
                        .executeTakeFirstOrThrow()
                        .then(r => r.name),
                    db.selectFrom("user_meta")
                        .select("email")
                        .where("id", "=", ctx.user.id)
                        .executeTakeFirstOrThrow()
                        .then(r => r.email),
                ])

                await sendEmailFromTemplate(input.email, "invitation", {
                    PROJECT_NAME: projectName,
                    INVITER: inviterEmail!,
                    INVITEE: input.email,
                    INVITATION_ID: invitationId,
                })
            }),

        listInvitations: projectPermissionProcedure("read")
            .query(async ({ ctx }) => {
                return db.selectFrom("project_invitations")
                    .selectAll()
                    .where("project_id", "=", ctx.projectId)
                    .orderBy("created_at", "desc")
                    .execute()
            }),

        cancelInvitation: projectPermissionProcedure("write")
            .input(z.object({ invitationId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                await db.deleteFrom("project_invitations")
                    .where("id", "=", input.invitationId)
                    .where("project_id", "=", ctx.projectId)
                    .executeTakeFirstOrThrow()
            }),

        acceptInvitation: authenticatedProcedure
            .input(z.object({ invitationId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                const email = await db.selectFrom("user_meta")
                    .select("email")
                    .where("id", "=", ctx.user.id)
                    .executeTakeFirstOrThrow()
                    .then(r => r.email)

                const invitation = await db.selectFrom("project_invitations")
                    .selectAll()
                    .where("id", "=", input.invitationId)
                    .where("invitee_email", "=", email)
                    .executeTakeFirst()

                if (!invitation)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "That invitation was invalid",
                    })

                await db.transaction().execute(async trx => Promise.all([
                    trx.insertInto("projects_users")
                        .values({
                            project_id: invitation.project_id,
                            user_id: ctx.user.id,
                        })
                        .executeTakeFirstOrThrow(),
                    trx.deleteFrom("project_invitations")
                        .where("id", "=", input.invitationId)
                        .executeTakeFirstOrThrow(),
                ]))

                return { projectId: invitation.project_id }
            }),
    },

    usage: projectPermissionProcedure("read")
        .query(async ({ ctx }) => {
            const { billing_start_date, billing_plan } = await db.selectFrom("projects")
                .select(["billing_start_date", "billing_plan"])
                .where("id", "=", ctx.projectId)
                .executeTakeFirstOrThrow()

            const billingPeriod = getCurrentBillingPeriod(billing_start_date)

            const [runCount, runCountByWorkflow, memberCount] = await Promise.all([
                db.selectFrom("workflow_runs")
                    .select(sql<string>`count(*)`.as("run_count"))
                    .where("project_id", "=", ctx.projectId)
                    .where("created_at", ">=", billingPeriod.start)
                    .where("created_at", "<", billingPeriod.end)
                    .executeTakeFirstOrThrow()
                    .then(r => parseInt(r.run_count)),
                db.selectFrom("workflow_runs")
                    .leftJoin("workflows", "workflow_runs.workflow_id", "workflows.id")
                    .select(["workflows.id", "workflows.name"])
                    .select(sql<string>`count(*)`.as("run_count"))
                    .where("workflow_runs.project_id", "=", ctx.projectId)
                    .where("workflow_runs.created_at", ">=", billingPeriod.start)
                    .where("workflow_runs.created_at", "<", billingPeriod.end)
                    .groupBy("workflows.id")
                    .execute()
                    .then(r => r.map(row => ({
                        ...row,
                        run_count: parseInt(row.run_count),
                    }))),
                db.selectFrom("projects_users")
                    .select(sql<string>`count(*)`.as("member_count"))
                    .where("project_id", "=", ctx.projectId)
                    .executeTakeFirstOrThrow()
                    .then(r => parseInt(r.member_count)),
            ])

            return { runCount, memberCount, runCountByWorkflow, plan: billing_plan }
        }),

    billing: {
        getPortalLink: projectPermissionProcedure("write")
            .input(z.object({ mode: z.enum(["manage", "upgrade"]).default("manage") }))
            .mutation(async ({ input, ctx }) => {
                const [project, portalConfigId] = await Promise.all([
                    db.selectFrom("projects")
                        .select(["stripe_customer_id", "stripe_subscription_id"])
                        .where("id", "=", ctx.projectId)
                        .executeTakeFirst(),
                    db.selectFrom("general_config")
                        .select("value")
                        .where("key", "=", STRIPE_PORTAL_CONFIG_KEY)
                        .executeTakeFirst()
                        .then(r => r?.value),
                ])

                if (!portalConfigId)
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Billing portal config not found. Sync to Stripe.",
                    })

                if (!project)
                    throw new TRPCError({ code: "NOT_FOUND" })
                if (!project.stripe_customer_id)
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Project has no Stripe customer ID. This is a bug.",
                    })
                if (!project.stripe_subscription_id)
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Project has no Stripe subscription ID. This is a bug.",
                    })

                const session = await stripe.billingPortal.sessions.create({
                    customer: project.stripe_customer_id,
                    configuration: portalConfigId,
                    return_url: `${useEnvVar("APP_ORIGIN")}/projects/${ctx.projectId}/usage-billing`,
                    ...input.mode === "upgrade" && {
                        flow_data: {
                            type: "subscription_update",
                            subscription_update: {
                                subscription: project.stripe_subscription_id,
                            },
                        }
                    },
                })

                return { url: session.url }
            }),
    },
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
