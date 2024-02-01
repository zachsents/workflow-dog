import cookieSession from "cookie-session"
import express from "express"
import type { SessionData } from "express-session"
import grant from "grant"
import morgan from "morgan"
import { addAccountToTeam, upsertIntegrationAccount } from "./db.js"
import serviceConfigs, { grantConfigs } from "./service-configs.js"
import { createClient } from "@supabase/supabase-js"
import { AuthorizationCode } from "simple-oauth2"
import type { AccessToken } from "simple-oauth2"
import defaultOAuthConfigs from "grant/config/oauth.json"
import merge from "lodash.merge"


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


/* -------------------------------------------------------------------------- */
/*                                 Grant Setup                                */
/* -------------------------------------------------------------------------- */

app.use(grant.default.express({
    defaults: {
        origin: process.env.NODE_ENV === "production" ?
            process.env.CLOUD_RUN_URL :
            `http://localhost:${port}`,
        transport: "state",
        response: ["tokens", "profile", "raw"],
    },
    ...grantConfigs,
}))


app.get("/connect/:serviceName/callback", async (req, res) => {

    const session = req.session as CustomSessionData
    const { access_token, refresh_token, profile, raw: raw_token } = res.locals.grant.response
    const serviceConfig = serviceConfigs[req.params.serviceName]

    const account = await upsertIntegrationAccount({
        service_name: req.params.serviceName,
        display_name: serviceConfig.getDisplayName(profile),
        service_user_id: serviceConfig.getServiceUserId(profile),
        access_token,
        refresh_token,
        profile,
        scopes: raw_token.scope?.split(/[\s,]+/) || [],
        raw_token: replaceExpiresIn(raw_token),
    })

    await addAccountToTeam(account.id, session.grant.dynamic.t)

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

    const serviceConfig = serviceConfigs[service_name]
    const grantConfig = serviceConfig.grantConfig
    const defaultGrantConfig = defaultOAuthConfigs[service_name]

    const tokenUrl = new URL(defaultGrantConfig?.access_url || grantConfig.access_url)

    const authClient = new AuthorizationCode({
        client: {
            id: serviceConfig.clientId,
            secret: serviceConfig.clientSecret,
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
        expires_at: new Date(Date.now() + (expires_in || 0) * 1000).toISOString()
    }
}