import { getSecret } from "@api/secrets.js"
import { CustomSessionData, defaultOAuth2AccountConfig, redirectUri } from "@api/util.js"
import type { Request, Response } from "express"
import { resolve as resolveIntegration } from "integrations/server.js"
import merge from "lodash.merge"
import omit from "lodash.omit"
import crypto from "node:crypto"


/**
 * @see https://developers.google.com/identity/protocols/oauth2/web-server
 */


export async function get(req: Request, res: Response) {
    const baseConfig = resolveIntegration(req.params.serviceName)?.oauth2
    if (!baseConfig)
        return res.status(404).send("Service not found")

    if (!req.query.t)
        return res.status(400).send("Missing team ID")

    const session = req.session as CustomSessionData
    session.team_id = req.query.t as string

    const config = merge({}, defaultOAuth2AccountConfig, baseConfig)

    const clientId = await getSecret(`INTEGRATION_${req.params.serviceName.toUpperCase()}_CLIENT_ID`)

    const url = new URL(config.authUrl)
    url.searchParams.append("client_id", clientId)
    url.searchParams.append("redirect_uri", redirectUri(req.get("host"), req.params.serviceName))
    url.searchParams.append("response_type", "code")

    const scopes = [...new Set(
        config.allowAdditionalScopes ?
            [...config.scopes, ...((req.query.scopes as string)?.split(/[\s,]+/) || [])] :
            config.scopes
    )]
    url.searchParams.set("scope", scopes.join(config.scopeDelimiter))

    if (config.state === true)
        url.searchParams.set("state", crypto.randomBytes(20).toString("hex"))
    else if (typeof config.state === "number")
        url.searchParams.set("state", crypto.randomBytes(config.state).toString("hex"))
    else if (config.state === "request")
        url.searchParams.set("state", req.query.state as string)
    else if (typeof config.state === "string")
        url.searchParams.set("state", config.state)

    if (url.searchParams.get("state"))
        session.state = url.searchParams.get("state")

    if (config.additionalParams) {
        Object.entries(config.additionalParams).forEach(([key, value]) => {
            url.searchParams.set(key, value as string)
        })
    }

    if (config.allowAdditionalParams) {
        const additionalParams = omit(req.query, ["t", "scopes", "state", "redirect_uri", "scope", "response_type", "client_id", "code"])

        Object.entries(additionalParams)
            .filter(([key]) =>
                Array.isArray(config.allowAdditionalParams) ?
                    config.allowAdditionalParams.includes(key) :
                    true
            )
            .forEach(([key, value]) => {
                url.searchParams.set(key, value as string)
            })
    }

    res.redirect(url.toString())
}