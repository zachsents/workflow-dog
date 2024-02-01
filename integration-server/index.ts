import { createClient } from "@supabase/supabase-js"
import cookieSession from "cookie-session"
import express from "express"
import type { SessionData } from "express-session"
import { resolve as resolveIntegration } from "integrations/server.js"
import merge from "lodash.merge"
import morgan from "morgan"
import crypto from "node:crypto"
import { AuthorizationCode } from "simple-oauth2"
import { addAccountToTeam, upsertIntegrationAccount } from "./db.js"
import { getSecret } from "./secrets.js"


const port = process.env.PORT ? parseInt(process.env.PORT) : 8080


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */
const app = express()
app.use(morgan("dev"))
app.use(cookieSession({
    signed: false,
    secure: false,
    maxAge: 5 * 60 * 1000,
}))


// See: https://developers.google.com/identity/protocols/oauth2/web-server

app.get("/oauth2/connect/:serviceName", async (req, res) => {

    const baseConfig = resolveIntegration(req.params.serviceName)?.oauth2
    if (!baseConfig)
        return res.status(404).send("Service not found")

    if (!req.query.t)
        return res.status(400).send("Missing team ID")

    const session = req.session as CustomSessionData
    session.team_id = req.query.t as string

    const config = merge({}, defaultConfig, baseConfig)

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

    res.redirect(url.toString())
})


app.get("/oauth2/connect/:serviceName/callback", async (req, res) => {

    if (req.query.error) {
        console.error("Error connecting service:", req.query.error)
        res.status(400).send(req.query.error_description || "Error connecting service")
        return
    }

    if (!req.query.code)
        return res.status(400).send("Missing code")

    const session = req.session as CustomSessionData

    if (!session.team_id)
        return res.status(400).send("Missing team ID")

    const baseConfig = resolveIntegration(req.params.serviceName)?.oauth2
    if (!baseConfig)
        return res.status(404).send("Service not found")

    const config = merge({}, defaultConfig, baseConfig)

    if (config.state && !(session.state && req.query.state && session.state === req.query.state))
        return res.status(400).send("Invalid state")

    const [clientId, clientSecret] = await Promise.all([
        getSecret(`INTEGRATION_${req.params.serviceName.toUpperCase()}_CLIENT_ID`),
        getSecret(`INTEGRATION_${req.params.serviceName.toUpperCase()}_CLIENT_SECRET`),
    ])

    const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: req.query.code,
            grant_type: "authorization_code",
            ...config.includeRedirectUriInTokenRequest && { redirect_uri: redirectUri(req.get("host"), req.params.serviceName) },
        } as Record<string, string>).toString(),
    }).then(res => {
        if (!res.ok) {
            console.debug(res)
            throw new Error("Failed to get access token")
        }
        return res.json()
    })

    const tokenObj = replaceExpiresIn(response) as any

    const profile = await fetch(config.profileUrl, {
        headers: {
            Authorization: `Bearer ${tokenObj.access_token}`,
        },
    }).then(res => res.json())

    const account = await upsertIntegrationAccount({
        service_name: req.params.serviceName,
        display_name: config.getDisplayName(profile, tokenObj),
        service_user_id: config.getServiceUserId(profile, tokenObj),
        access_token: tokenObj.access_token,
        refresh_token: tokenObj.refresh_token,
        profile,
        raw_token: tokenObj,
        ...tokenObj.scope && { scopes: tokenObj.scope?.split(/[\s,]+/) || [] },
    })

    await addAccountToTeam(account.id, session.team_id)

    res.send("<p>Connected! You can close this tab now.</p><script>window.close()</script>")
})


app.get("/account/:accountId/token", async (req, res) => {

    const apiKey = req.headers.authorization?.split("Bearer ")[1] || ""
    const client = createClient(process.env.SUPABASE_URL, apiKey)

    const { data: { raw_token, service_name } } = await client.from("integration_accounts")
        .select("raw_token, service_name")
        .eq("id", req.params.accountId)
        .single()
        .throwOnError()

    const baseConfig = resolveIntegration(service_name)?.oauth2
    const config = merge({}, defaultConfig, baseConfig)

    const tokenUrl = new URL(config.tokenUrl)

    const [clientId, clientSecret] = await Promise.all([
        getSecret(`INTEGRATION_${service_name.toUpperCase()}_CLIENT_ID`),
        getSecret(`INTEGRATION_${service_name.toUpperCase()}_CLIENT_SECRET`),
    ])

    const authClient = new AuthorizationCode({
        client: {
            id: clientId,
            secret: clientSecret,
        },
        auth: {
            tokenHost: tokenUrl.origin,
            tokenPath: tokenUrl.pathname,
        },
    })

    const token = authClient.createToken(raw_token)

    if (!token.expired(120))
        return res.send({
            access_token: token.token.access_token,
            refreshed: false,
        })

    try {
        const newToken = await token.refresh()

        await client.from("integration_accounts")
            .update({
                raw_token: merge({}, raw_token, replaceExpiresIn(newToken.token)),
                access_token: newToken.token.access_token,
                ...newToken.token.refresh_token && { refresh_token: newToken.token.refresh_token },
            })
            .eq("id", req.params.accountId)
            .throwOnError()

        return res.send({
            access_token: newToken.token.access_token,
            refreshed: true,
        })
    } catch (error) {
        console.log("Error refreshing access token: ", error.message)
        return res.status(500).send({ error: "Error refreshing access token" })
    }
})


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("Integration server running on port", port, `(${process.env.NODE_ENV})`)
})


/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

interface CustomSessionData extends SessionData {
    team_id?: string,
    state?: string,
    grant?: {
        provider: string,
        dynamic: {
            t: string,
        },
    }
}

function replaceExpiresIn(token: { expires_in?: number }) {
    const { expires_in, ...rest } = token

    return {
        ...rest,
        ...expires_in != null && { expires_at: new Date(Date.now() + (expires_in || 0) * 1000).toISOString() }
    }
}

const defaultConfig = {
    scopeDelimiter: " ",
    state: false,
    scopes: [],
    allowAdditionalScopes: false,
    includeRedirectUriInTokenRequest: true,
}


function redirectUri(host: string, serviceName: string) {
    return `${host.includes("localhost") ? "http" : "https"}://${host}/oauth2/connect/${serviceName}/callback`
}