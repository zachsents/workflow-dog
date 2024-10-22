import { TRPCError } from "@trpc/server"
import _omit from "lodash/omit"
import _pick from "lodash/pick"
import { createHash, randomBytes } from "node:crypto"
import { ServerThirdPartyProviders } from "workflow-packages/server"
import { z } from "zod"
import { db } from "../../lib/db"
import { fetchProfile, OAUTH2_CALLBACK_URL } from "../../lib/internal/third-party"
import { projectPermissionProcedure } from "./projects"
import { encryptJSON } from "../../lib/encryption"
import { useEnvVar } from "../../lib/utils"


const OAUTH2_PROVIDER_IDS = Object.entries(ServerThirdPartyProviders)
    .filter(([, v]) => v.type === "oauth2")
    .map(([k]) => k)
const API_KEY_PROVIDER_IDS = Object.entries(ServerThirdPartyProviders)
    .filter(([, v]) => v.type === "api_key")
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
        }),

    addApiKeyAccount: projectPermissionProcedure("write")
        .input(z.object({
            providerId: z.enum(API_KEY_PROVIDER_IDS as [string, ...string[]]),
            apiKey: z.string().min(1),
        }))
        .mutation(async ({ input, ctx }) => {
            const provider = ServerThirdPartyProviders[input.providerId]

            if (provider.type !== "api_key")
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Provider "${input.providerId}" is not an API key provider`,
                })

            const profile = await fetchProfile(provider.config.profileUrl, input.apiKey)
            const tokenObj = { apiKey: input.apiKey }

            const displayName = provider.config.getDisplayName
                ? provider.config.getDisplayName({ profile, token: tokenObj })
                : tokenObj.apiKey.slice(0, 8) + `... (${profile.email || profile.id || profile.sub || "?"})`

            const accountId = await db.transaction().execute(async trx => {
                const { id: accountId } = await trx.insertInto("third_party_accounts")
                    .values({
                        display_name: displayName,
                        provider_id: input.providerId,
                        provider_user_id: createHash("md5").update(input.apiKey).digest("hex"),
                        encrypted_auth_data: encryptJSON({
                            ...tokenObj,
                            profile,
                        }, useEnvVar("SERVICE_ACCOUNT_ENCRYPTION_KEY")),
                        scopes: [],
                        email: profile.email || null,
                    })
                    .onConflict(oc => oc.columns(["provider_id", "provider_user_id"]).doUpdateSet(eb => ({
                        display_name: eb.ref("excluded.display_name"),
                        provider_user_id: eb.ref("excluded.provider_user_id"),
                        encrypted_auth_data: eb.ref("excluded.encrypted_auth_data"),
                        email: eb.ref("excluded.email"),
                    })))
                    .returning("id")
                    .executeTakeFirstOrThrow()

                await trx.insertInto("projects_third_party_accounts")
                    .values({
                        project_id: ctx.projectId,
                        third_party_account_id: accountId,
                    })
                    .onConflict(oc => oc.columns(["project_id", "third_party_account_id"]).doNothing())
                    .executeTakeFirstOrThrow()

                return accountId
            })

            return { accountId }
        }),
}