import { ServiceDefinitions } from "@pkg/server"
import { OAuth2Config } from "@pkg/types/server"
import { CodedError } from "@web/lib/utils"
import axios from "axios"
import { type Selectable } from "kysely"
import _ from "lodash"
import { type ServiceAccounts } from "shared/db"
import { db } from "../db"
import { decryptJSON, encryptJSON } from "../encryption"


if (!process.env.SERVICE_ACCOUNT_ENCRYPTION_KEY)
    throw new Error("SERVICE_ACCOUNT_ENCRYPTION_KEY not set")


export async function getServiceAccountToken(accountId: string) {

    const account = await db.selectFrom("service_accounts")
        .selectAll()
        .where("id", "=", accountId)
        .executeTakeFirstOrThrow()

    if (!account.service_def_id)
        throw new Error("Service definition ID not set in service account row")

    const serviceDef = ServiceDefinitions.get(account.service_def_id)

    if (!serviceDef)
        throw new Error("Service definition not found")

    const token = decryptJSON(account.encrypted_token, process.env.SERVICE_ACCOUNT_ENCRYPTION_KEY!)

    switch (serviceDef.authorizationMethod) {
        case "oauth2":
            return await getFreshOAuth2AccessToken(account)
        case "api_key":
            return { key: token.key }
        default:
            return token
    }
}


export async function getFreshOAuth2AccessToken(account: Selectable<ServiceAccounts>) {

    const decryptedToken = decryptJSON(
        account.encrypted_token,
        process.env.SERVICE_ACCOUNT_ENCRYPTION_KEY!
    )

    // If the token is not expired, return it. Includes a 2 minute buffer.
    if (
        decryptedToken.access_token
        && new Date(decryptedToken.expires_at) > new Date(Date.now() + 120 * 1000)
    )
        return {
            access_token: decryptedToken.access_token,
            refreshed: false,
        }

    // Should contain a refresh token, but if not, throw an error.
    if (!account.refresh_token)
        throw new CodedError("No refresh token available. You might need to revoke access to WorkflowDog through the service's settings and then try connecting again.", 401)

    const serviceDef = ServiceDefinitions.get(account.service_def_id!)

    const oauthConfig = (serviceDef as any).oauth2Config as OAuth2Config

    try {
        const refreshResponse = await fetch(oauthConfig.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: "follow",
            body: new URLSearchParams({
                client_id: oauthConfig.clientId,
                client_secret: oauthConfig.clientSecret,
                grant_type: "refresh_token",
                refresh_token: account.refresh_token,
            }).toString(),
        })

        if (!refreshResponse.ok)
            throw new CodedError(await refreshResponse.text(), refreshResponse.status)

        const {
            refresh_token: newRefresh,
            ...newToken
        } = cleanToken(await refreshResponse.json(), oauthConfig.scopeDelimiter)

        const profile = await fetchProfile(oauthConfig.profileUrl, newToken.access_token)

        await db.updateTable("service_accounts")
            .set({
                encrypted_token: encryptJSON(
                    _.merge({}, decryptedToken, newToken),
                    process.env.SERVICE_ACCOUNT_ENCRYPTION_KEY!
                ),
                profile,
                display_name: oauthConfig.getDisplayName(profile, newToken),
                ...newRefresh && { refresh_token: newRefresh },
            })
            .where("id", "=", account.id)
            .executeTakeFirstOrThrow()

        return {
            access_token: newToken.access_token,
            refreshed: true,
        }
    }
    catch (err) {
        console.error(err)
        throw new CodedError("Failed to refresh token", 500)
    }
}


/**
 * Does a few things:
 * - Removes the `expires_in` property and adds an `expires_at` property as ISO date
 * - Splits the `scope` property into an array
 */
export function cleanToken<T extends { expires_in?: number, scope?: string, [k: string]: any }>(token: T, scopeDelimiter: string | RegExp = /[\s,]+/) {
    const { expires_in, ...rest } = token

    return {
        ...rest,
        ...expires_in != null && {
            expires_at: new Date(Date.now() + (expires_in || 0) * 1000).toISOString()
        },
        ...rest.scope != null && {
            scopes: rest.scope.split(scopeDelimiter)
        },
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


export function oauth2RedirectUrl(serviceDefId: string) {
    return `${process.env.NEXT_PUBLIC_API_URL}/oauth2/connect/${serviceDefId}/callback`
}
