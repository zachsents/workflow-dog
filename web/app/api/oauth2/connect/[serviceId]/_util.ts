import { getSecret } from "@web/lib/server/google"
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