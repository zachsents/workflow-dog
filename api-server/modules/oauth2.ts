import type { SupabaseClient } from "@supabase/supabase-js"
import { randomBytes } from "crypto"
import type { Request, Response } from "express"
import merge from "lodash.merge"
import omit from "lodash.omit"
import { ServiceDefinitions } from "packages/server.js"
import type { OAuth2Config } from "packages/types.js"
import { addAccountToTeam, client as db } from "./db.js"
import { getSecret } from "./secrets.js"
import { checkForErrorThenJson } from "shared/requests.js"


/**
 * @see https://developers.google.com/identity/protocols/oauth2/web-server
 */
export async function oauth2AuthorizationRedirect(req: Request, res: Response) {

    const service = ServiceDefinitions.resolve(req.params.serviceName)

    if (!service)
        return res.status(404).send("Service not found")

    if (!req.query.t)
        return res.status(400).send("Missing team ID")

    const session = req.session as OAuth2SessionData
    session.team_id = req.query.t as string

    const oauthConfig = merge({}, defaultOAuth2AccountConfig as unknown, service.authAcquisition)

    const { clientId } = await getClientForService(service.id, false)

    const url = new URL(oauthConfig.authUrl)
    url.searchParams.append("client_id", clientId)
    url.searchParams.append("redirect_uri", redirectUri(req.get("host"), req.params.serviceName))
    url.searchParams.append("response_type", "code")

    const scopes = [...new Set(
        oauthConfig.allowAdditionalScopes ?
            [...oauthConfig.scopes, ...((req.query.scopes as string)?.split(/[\s,]+/) || [])] :
            oauthConfig.scopes
    )]
    url.searchParams.set("scope", scopes.join(oauthConfig.scopeDelimiter))

    if (oauthConfig.state === true)
        url.searchParams.set("state", randomBytes(20).toString("hex"))
    else if (typeof oauthConfig.state === "number")
        url.searchParams.set("state", randomBytes(oauthConfig.state).toString("hex"))
    else if (oauthConfig.state === "request")
        url.searchParams.set("state", req.query.state as string)
    else if (typeof oauthConfig.state === "string")
        url.searchParams.set("state", oauthConfig.state)

    if (url.searchParams.get("state"))
        session.state = url.searchParams.get("state")

    if (oauthConfig.additionalParams) {
        Object.entries(oauthConfig.additionalParams).forEach(([key, value]) => {
            url.searchParams.set(key, value as string)
        })
    }

    if (oauthConfig.allowAdditionalParams) {
        const additionalParams = omit(req.query, ["t", "scopes", "state", "redirect_uri", "scope", "response_type", "client_id", "code"])

        Object.entries(additionalParams)
            .filter(([key]) =>
                Array.isArray(oauthConfig.allowAdditionalParams) ?
                    oauthConfig.allowAdditionalParams.includes(key) :
                    true
            )
            .forEach(([key, value]) => {
                url.searchParams.set(key, value as string)
            })
    }

    res.redirect(url.toString())
}


export async function oauth2Callback(req: Request, res: Response) {

    if (req.query.error) {
        console.error("Error connecting service:", req.query.error)
        res.status(400).send(req.query.error_description || "Error connecting service")
        return
    }

    if (!req.query.code)
        return res.status(400).send("Missing code")

    const session = req.session as OAuth2SessionData

    if (!session.team_id)
        return res.status(400).send("Missing team ID")

    const service = ServiceDefinitions.resolve(req.params.serviceName)

    if (!service)
        return res.status(404).send("Service not found")

    const config = merge({}, defaultOAuth2AccountConfig as unknown, service.authAcquisition)

    if (config.state && !(session.state && req.query.state && session.state === req.query.state))
        return res.status(400).send("Invalid state")

    const { clientId, clientSecret } = await getClientForService(service.id, true)

    const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: req.query.code,
            grant_type: "authorization_code",
            ...config.includeRedirectUriInTokenRequest && {
                redirect_uri: redirectUri(req.get("host"), req.params.serviceName)
            },
        } as any).toString(),
    }).then(checkForErrorThenJson)

    const { refresh_token, ...tokenObj } = cleanToken(response)

    const profile = await fetchProfile(config.profileUrl, tokenObj.access_token)

    const { data: { id: newAccountId } } = await db
        .from("integration_accounts")
        .upsert({
            service_id: service.id,
            service_user_id: config.getServiceUserId(profile, tokenObj),
            display_name: config.getDisplayName(profile, tokenObj),
            profile,
            token: tokenObj,
            // adding this as a separate field so it doesn't get overwritten 
            // by other token updates
            ...refresh_token && { refresh_token },
        }, {
            onConflict: "service_id, service_user_id",
        }).select("id")
        .single()
        .throwOnError()

    await addAccountToTeam(newAccountId, session.team_id)

    res.send("<p>Connected! You can close this tab now.</p><script>window.close()</script>")
}


export async function getTokenForOAuth2Account(req: Request, res: Response, account: any, requesterClient: SupabaseClient<any, "public", any>) {

    const { service_id, refresh_token, token } = account

    // If the token is not expired, return it. Includes a 2 minute buffer.
    if (new Date(token.expires_at) > new Date(Date.now() + 120 * 1000))
        return res.send({
            access_token: token.access_token,
            refreshed: false,
        })

    if (!refresh_token)
        return res.status(400).send("No refresh token available. You might need to revoke access to WorkflowDog through the service's settings and then try connecting again.")

    const service = ServiceDefinitions.get(service_id)

    const oauthConfig = merge({}, defaultOAuth2AccountConfig as unknown, service.authAcquisition)

    const { clientId, clientSecret } = await getClientForService(service.id, true)

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
        }).then(checkForErrorThenJson)

        const { refresh_token: newRefresh, ...newToken } = cleanToken(refreshResponse)

        const profile = await fetchProfile(oauthConfig.profileUrl, newToken.access_token)

        await requesterClient.from("integration_accounts")
            .update({
                token: merge({}, token, newToken),
                profile,
                display_name: oauthConfig.getDisplayName(profile, newToken),
                ...newRefresh && { refresh_token: newRefresh },
            })
            .eq("id", req.params.accountId)
            .throwOnError()

        return res.send({
            access_token: newToken.access_token,
            refreshed: true,
        })
    }
    catch (err) {
        console.error(err)
        return res.status(500).send("Failed to refresh token")
    }
}


interface OAuth2SessionData {
    team_id?: string,
    state?: string,
    grant?: {
        provider: string,
        dynamic: {
            t: string,
        },
    }
}

const defaultOAuth2AccountConfig: Partial<OAuth2Config> = {
    scopeDelimiter: " ",
    state: false,
    scopes: [],
    allowAdditionalScopes: false,
    includeRedirectUriInTokenRequest: true,
}

function redirectUri(host: string, serviceName: string) {
    return `${host.includes("localhost") ? "http" : "https"}://${host}/oauth2/connect/${serviceName}/callback`
}


/**
 * Does a few things:
 * - Removes the `expires_in` property and adds an `expires_at` property as ISO date
 * - Splits the `scope` property into an array
 */
function cleanToken<T extends { expires_in?: number, scope?: string, [k: string]: any }>(token: T) {
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


async function getClientForService(serviceId: string, includeSecret = false) {

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
async function fetchProfile(profileUrl: string, accessToken: string) {
    return fetch(profileUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then(checkForErrorThenJson)
}
