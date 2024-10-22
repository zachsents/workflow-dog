import axios from "axios"
import type { Request, Response } from "express"
import _ from "lodash"
import { ServerThirdPartyProviders } from "workflow-packages/server"
import { db } from "../db"
import { decryptJSON, encryptJSON } from "../encryption"
import { useEnvVar } from "../utils"


export const OAUTH2_CALLBACK_URL = `${useEnvVar("APP_ORIGIN")}/api/thirdparty/oauth2/callback`


export async function handleThirdPartyOAuth2Callback(req: Request, res: Response) {

    if (req.query.error) {
        console.error("Error connecting service:", req.query.error)
        return res.json({
            error: req.query.error,
            error_description: req.query.error_description,
        })
    }

    if (!req.query.code || typeof req.query.code !== "string")
        return res.status(400).send("No code provided")

    if (!req.query.state || typeof req.query.state !== "string")
        return res.status(400).send("No state provided")

    const requestRecord = await db.selectFrom("third_party_oauth2_requests")
        .selectAll()
        .where("id", "=", req.query.state)
        .executeTakeFirst()

    if (!requestRecord)
        return res.status(400).send("Invalid state")

    const provider = ServerThirdPartyProviders[requestRecord.provider_id]
    if (!provider)
        res.status(400).send(`Provider "${requestRecord.provider_id}" not found`)
    if (provider.type !== "oauth2")
        return res.status(400).send(`Provider "${requestRecord.provider_id}" is not an OAuth2 provider`)

    const tokenResponse = await fetch(provider.config.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: provider.config.clientId,
            client_secret: provider.config.clientSecret,
            code: req.query.code,
            grant_type: "authorization_code",
            ...provider.config.includeRedirectUriInTokenRequest && {
                redirect_uri: OAUTH2_CALLBACK_URL,
            },
        }).toString(),
    })

    if (!tokenResponse.ok)
        return res.status(tokenResponse.status).json(await tokenResponse.json())

    const tokenObj = await tokenResponse.json()
    if (tokenObj.expires_in)
        tokenObj.expires_at = new Date(Date.now() + (tokenObj.expires_in * 1000)).toISOString()
    if (tokenObj.scope)
        tokenObj.scopes = tokenObj.scope.split(provider.config.scopeDelimiter)

    const profile = await fetchProfile(provider.config.profileUrl, tokenObj.access_token)

    await db.transaction().execute(async trx => {
        const { id: accountId } = await trx.insertInto("third_party_accounts")
            .values({
                display_name: provider.config.getDisplayName({ profile, token: tokenObj }),
                provider_id: requestRecord.provider_id,
                provider_user_id: provider.config.getProviderUserId({ profile, token: tokenObj }),
                encrypted_auth_data: encryptJSON({
                    ...tokenObj,
                    profile,
                }, useEnvVar("SERVICE_ACCOUNT_ENCRYPTION_KEY")),
                scopes: tokenObj.scopes || [],
                email: profile.email || null,
            })
            .onConflict(oc => oc.columns(["provider_id", "provider_user_id"]).doUpdateSet(eb => ({
                display_name: eb.ref("excluded.display_name"),
                scopes: eb.ref("excluded.scopes"),
                encrypted_auth_data: eb.ref("excluded.encrypted_auth_data"),
                email: eb.ref("excluded.email"),
            })))
            .returning("id")
            .executeTakeFirstOrThrow()

        await trx.insertInto("projects_third_party_accounts")
            .values({
                project_id: requestRecord.project_id,
                third_party_account_id: accountId,
            })
            .onConflict(oc => oc.columns(["project_id", "third_party_account_id"]).doNothing())
            .executeTakeFirstOrThrow()
    })

    res.header("Content-Type", "text/html").send("<p>Connected! You can close this tab now.</p><script>window.close()</script>")
}


export async function getThirdPartyAccountToken(accountId: string) {

    const { encrypted_auth_data, ...account } = await db.selectFrom("third_party_accounts")
        .select(["encrypted_auth_data", "provider_id", "provider_user_id", "email"])
        .where("id", "=", accountId)
        .executeTakeFirstOrThrow()

    const serviceDef = ServerThirdPartyProviders[account.provider_id]

    if (!serviceDef)
        throw new Error("Service definition not found")

    const authData = decryptJSON(
        encrypted_auth_data,
        useEnvVar("SERVICE_ACCOUNT_ENCRYPTION_KEY"),
    )

    switch (serviceDef.type) {
        case "oauth2":
            return {
                ...await getFreshOAuth2AccessToken({
                    accountId,
                    providerId: account.provider_id,
                    authData,
                }),
                account,
            }
        case "api_key":
            return { apiKey: authData.apiKey, account }
        default:
            return authData
    }
}


export async function getFreshOAuth2AccessToken({
    accountId, providerId, authData,
}: {
    accountId: string
    providerId: string
    authData: any
}) {
    // If the token is not expired, return it. Includes a 2 minute buffer.
    if (
        authData.access_token
        && new Date(authData.expires_at) > new Date(Date.now() + 120 * 1000)
    )
        return {
            accessToken: authData.access_token,
            refreshed: false,
        }

    // Should contain a refresh token, but if not, throw an error.
    if (!authData.refresh_token)
        throw new Error("No refresh token available. You might need to revoke access to WorkflowDog through the service's settings and then try connecting again.")

    const serviceDef = ServerThirdPartyProviders[providerId]
    if (!serviceDef)
        throw new Error("Service definition not found")
    if (serviceDef.type !== "oauth2")
        throw new Error("Service definition is not an OAuth2 provider")

    try {
        const refreshResponse = await fetch(serviceDef.config.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: serviceDef.config.clientId,
                client_secret: serviceDef.config.clientSecret,
                grant_type: "refresh_token",
                refresh_token: authData.refresh_token,
            }).toString(),
        })

        if (!refreshResponse.ok)
            throw new Error(`${await refreshResponse.text()} (${refreshResponse.status})`)

        const newToken = await refreshResponse.json()

        if (newToken.expires_in)
            newToken.expires_at = new Date(Date.now() + (newToken.expires_in * 1000)).toISOString()
        if (newToken.scope)
            newToken.scopes = newToken.scope.split(serviceDef.config.scopeDelimiter)

        const profile = await fetchProfile(serviceDef.config.profileUrl, newToken.access_token)

        await db.updateTable("third_party_accounts")
            .set({
                encrypted_auth_data: encryptJSON(
                    _.merge({}, authData, newToken, { profile }),
                    useEnvVar("SERVICE_ACCOUNT_ENCRYPTION_KEY")
                ),
                display_name: serviceDef.config.getDisplayName({ profile, token: newToken }),
            })
            .where("id", "=", accountId)
            .executeTakeFirstOrThrow()

        return {
            accessToken: newToken.access_token,
            refreshed: true,
        }
    }
    catch (err) {
        console.error(err)
        throw new Error("Failed to refresh token")
    }
}


/**
 * We're assuming that all OAuth2 providers expect the access token as
 * a bearer token in the Authorization header.
 */
export async function fetchProfile(profileUrl: string, accessToken: string) {
    return await axios.get(profileUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    }).then(r => r.data)
}


export function oauth2RedirectUrl(providerId: string) {
    return `${useEnvVar("APP_ORIGIN")}/api/thirdparty/${providerId.split(":")[1]}/callback`
}
