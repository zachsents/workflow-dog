import type { SupabaseClient } from "@supabase/supabase-js"
import { getSecret } from "@web/lib/server/google"
import type { Database } from "@web/lib/types/supabase-db"
import { CodedError } from "@web/lib/utils"
import _ from "lodash"
import { ServiceDefinitions } from "packages/server"
import type { OAuth2Config } from "packages/types"
import "server-only"


export const defaultOAuth2AccountConfig: Partial<OAuth2Config> = {
    scopeDelimiter: " ",
    state: false,
    scopes: [],
    allowAdditionalScopes: false,
    includeRedirectUriInTokenRequest: true,
}

export function redirectUri(host: string, serviceName: string) {
    return `${host.includes("localhost") ? "http" : "https"}://${host}/api/oauth2/connect/${serviceName}/callback`
}


/**
 * Does a few things:
 * - Removes the `expires_in` property and adds an `expires_at` property as ISO date
 * - Splits the `scope` property into an array
 */
export function cleanToken<T extends { expires_in?: number, scope?: string, [k: string]: any }>(token: T) {
    const { expires_in, ...rest } = token

    return {
        ...rest,
        ...expires_in != null && {
            expires_at: new Date(Date.now() + (expires_in || 0) * 1000).toISOString()
        },
        ...rest.scope != null && {
            // this scope splitting could be a bug in very very few unlikely scenarios
            scopes: rest.scope.split(/[\s,]+/)
        },
    }
}


export async function getOAuthClientForService(serviceId: string, includeSecret = false) {

    const serviceName = ServiceDefinitions.safeName(serviceId)

    const promises = [
        getSecret(`INTEGRATION_${serviceName.toUpperCase()}_CLIENT_ID`),
    ]

    if (includeSecret)
        promises.push(getSecret(`INTEGRATION_${serviceName.toUpperCase()}_CLIENT_SECRET`))

    const [clientId, clientSecret] = await Promise.all(promises)
    return { clientId, clientSecret }
}


/**
 * We're assuming that all OAuth2 providers expect the access token as
 * a bearer token in the Authorization header.
 */
export async function fetchProfile(profileUrl: string, accessToken: string) {
    return fetch(profileUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then(async res => {
        if (!res.ok)
            throw new Error(await res.text())
        return res.json()
    })
}


export async function getTokenForOAuth2Account(account: any, requesterClient: SupabaseClient<Database, "public", any>) {

    const { service_id, refresh_token, token } = account

    // If the token is not expired, return it. Includes a 2 minute buffer.
    if (new Date(token.expires_at) > new Date(Date.now() + 120 * 1000))
        return {
            access_token: token.access_token,
            refreshed: false,
        }

    if (!refresh_token)
        throw new CodedError("No refresh token available. You might need to revoke access to WorkflowDog through the service's settings and then try connecting again.", 401)

    const service = ServiceDefinitions.get(service_id)

    const oauthConfig = _.merge({}, defaultOAuth2AccountConfig, service?.authAcquisition) as OAuth2Config

    const { clientId, clientSecret } = await getOAuthClientForService(service_id, true)

    try {
        const refreshResponse = await fetch(oauthConfig.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: "follow",
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "refresh_token",
                refresh_token,
            } as Record<string, string>).toString(),
        })

        if (!refreshResponse.ok)
            throw new CodedError(await refreshResponse.text(), refreshResponse.status)

        const { refresh_token: newRefresh, ...newToken } = cleanToken(await refreshResponse.json())

        const profile = await fetchProfile(oauthConfig.profileUrl, newToken.access_token)

        await requesterClient
            .from("integration_accounts")
            .update({
                token: _.merge({}, token, newToken),
                profile,
                display_name: oauthConfig.getDisplayName(profile, newToken),
                ...newRefresh && { refresh_token: newRefresh },
            })
            .eq("id", account.id)
            .throwOnError()

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