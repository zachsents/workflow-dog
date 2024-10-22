import { TRPCError } from "@trpc/server"
import _omit from "lodash/omit"
import _pick from "lodash/pick"
import { randomBytes } from "node:crypto"
import { ServerThirdPartyProviders } from "workflow-packages/server"
import { z } from "zod"
import { db } from "../../lib/db"
import { OAUTH2_CALLBACK_URL } from "../../lib/internal/third-party"
import { projectPermissionProcedure } from "./projects"


const OAUTH2_PROVIDER_IDS = Object.entries(ServerThirdPartyProviders)
    .filter(([, v]) => v.type === "oauth2")
    .map(([k]) => k)


export default {
    list: projectPermissionProcedure("read")
        .input(z.object({
            providerId: z.enum(Object.keys(ServerThirdPartyProviders) as [string, ...string[]]).optional(),
        }))
        .query(async ({ input, ctx }) => {
            let qb = db.selectFrom("third_party_accounts")
                .innerJoin("projects_third_party_accounts", "third_party_account_id", "id")
                .select(["id", "created_at", "display_name", "scopes", "provider_id", "email"])
                .where("project_id", "=", ctx.projectId)

            if (input.providerId)
                qb = qb.where("provider_id", "=", input.providerId)

            return qb.execute()
        }),

    getOAuth2AuthorizationUrl: projectPermissionProcedure("write")
        .input(z.object({
            providerId: z.enum(OAUTH2_PROVIDER_IDS as [string, ...string[]]),
            scopes: z.string().array().default([]),
            additionalParams: z.record(z.string()).default({}).transform(
                params => _omit(params, ["t", "scopes", "state", "redirect_uri", "scope", "response_type", "client_id", "code"])
            ),
        }))
        .mutation(async ({ input, ctx }) => {
            const provider = ServerThirdPartyProviders[input.providerId]

            // zod already checks this but typescript doesn't know that
            if (provider.type !== "oauth2")
                throw new TRPCError({ code: "BAD_REQUEST", message: `Provider "${input.providerId}" is not an OAuth2 provider` })

            const url = new URL(provider.config.authUrl)

            url.searchParams.append("client_id", provider.config.clientId)
            url.searchParams.append("redirect_uri", OAUTH2_CALLBACK_URL)
            url.searchParams.append("response_type", "code")

            const scopes = Array.from(new Set([
                ...provider.config.scopes,
                ...(provider.config.allowAdditionalScopes ? input.scopes : []),
            ]))
            url.searchParams.set("scope", scopes.join(provider.config.scopeDelimiter))

            const state = randomBytes(provider.config.stateLength ?? 32).toString("hex")
            url.searchParams.set("state", state)

            if (provider.config.additionalParams) {
                Object.entries(provider.config.additionalParams).forEach(([k, v]) => {
                    url.searchParams.set(k, v)
                })
            }

            if (provider.config.allowAdditionalParams) {
                Object.entries(
                    Array.isArray(provider.config.allowAdditionalParams)
                        ? _pick(input.additionalParams, provider.config.allowAdditionalParams)
                        : input.additionalParams
                ).forEach(([k, v]) => {
                    url.searchParams.set(k, v)
                })
            }

            await db.insertInto("third_party_oauth2_requests").values({
                id: state,
                project_id: ctx.projectId,
                provider_id: provider.id,
            }).executeTakeFirstOrThrow()

            return { url: url.toString() }
        })

    // getToken: t.procedure
    //     .input(z.object({
    //         accountId: z.string(),
    //         requestingWorkflowId: z.string().uuid().optional(),
    //         requestingProjectId: z.string().uuid().optional(),
    //     }))
    //     .query(async ({ input, ctx }) => {
    //         assertAdmin(ctx)

    //         if (input.requestingProjectId) {
    //             const isValid = await db.selectNoFrom(eb => eb.exists(
    //                 eb.selectFrom("projects_service_accounts")
    //                     .where("service_account_id", "=", input.accountId)
    //                     .where("project_id", "=", input.requestingProjectId!)
    //             ).as("exists"))
    //                 .executeTakeFirstOrThrow()
    //                 .then(r => Boolean(r.exists))

    //             if (!isValid)
    //                 throw new TRPCError({
    //                     code: "FORBIDDEN",
    //                     message: `Service account (${input.accountId}) is not linked to the project (${input.requestingProjectId}).`,
    //                 })
    //         }

    //         if (input.requestingWorkflowId) {
    //             const isValid = await db.selectNoFrom(eb => eb.exists(
    //                 eb.selectFrom("projects_service_accounts")
    //                     .where("service_account_id", "=", input.accountId)
    //                     .where(eb => eb(
    //                         "project_id", "=",
    //                         eb.selectFrom("workflows")
    //                             .select("workflows.project_id")
    //                             .where("workflows.id", "=", input.requestingWorkflowId!)
    //                     ))
    //             ).as("exists"))
    //                 .executeTakeFirstOrThrow()
    //                 .then(r => Boolean(r.exists))

    //             if (!isValid)
    //                 throw new TRPCError({
    //                     code: "FORBIDDEN",
    //                     message: `Service account (${input.accountId}) is not linked to the project that workflow (${input.requestingWorkflowId}) is a part of.`,
    //                 })
    //         }

    //         const token = await getServiceAccountToken(input.accountId)

    //         return token
    //     }),
}