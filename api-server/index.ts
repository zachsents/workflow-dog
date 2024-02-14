import { createClient } from "@supabase/supabase-js"
import cookieSession from "cookie-session"
import cors from "cors"
import express from "express"
import { resolve as resolveIntegration } from "integrations/server.js"
import merge from "lodash.merge"
import omit from "lodash.omit"
import morgan from "morgan"
import crypto, { createHash } from "node:crypto"
import { addAccountToTeam, client, isUserEditorForTeam, upsertIntegrationAccount } from "./db.js"
import { getAccessToken, getSecret, projectId } from "./secrets.js"


const port = process.env.PORT ? parseInt(process.env.PORT) : 8080


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */
const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(cookieSession({
    signed: false,
    secure: false,
    maxAge: 5 * 60 * 1000,
}))


/**
 * @see https://developers.google.com/identity/protocols/oauth2/web-server
 */
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
        redirect: "follow",
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: req.query.code,
            grant_type: "authorization_code",
            ...config.includeRedirectUriInTokenRequest && {
                redirect_uri: redirectUri(req.get("host"), req.params.serviceName)
            },
        } as Record<string, string>).toString(),
    }).then(checkForErrorThenJson)

    const tokenObj = replaceExpiresIn(response) as any

    const profile = await fetchProfile(config.profileUrl, tokenObj.access_token)

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

    const { data: { refresh_token, raw_token, service_name } } = await client.from("integration_accounts")
        .select("refresh_token, raw_token, service_name")
        .eq("id", req.params.accountId)
        .single()
        .throwOnError()

    // If the token is not expired, return it. Includes a 2 minute buffer.
    if (new Date(raw_token.expires_at) > new Date(Date.now() + 120 * 1000))
        return res.send({
            access_token: raw_token.access_token,
            refreshed: false,
        })

    if (!refresh_token)
        return res.status(400).send("No refresh token available. You might need to revoke access to WorkflowDog through the service's settings and then try connecting again.")

    const baseConfig = resolveIntegration(service_name)?.oauth2
    const config = merge({}, defaultConfig, baseConfig)

    const [clientId, clientSecret] = await Promise.all([
        getSecret(`INTEGRATION_${service_name.toUpperCase()}_CLIENT_ID`),
        getSecret(`INTEGRATION_${service_name.toUpperCase()}_CLIENT_SECRET`),
    ])

    try {
        const refreshResponse = await fetch(config.tokenUrl, {
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
            .then(checkForErrorThenJson)

        const newToken = replaceExpiresIn(refreshResponse) as any
        const profile = await fetchProfile(config.profileUrl, newToken.access_token as string)

        await client.from("integration_accounts")
            .update({
                raw_token: merge({}, raw_token, newToken),
                access_token: newToken.access_token,
                profile,
                display_name: config.getDisplayName(profile, newToken),
                ...newToken.refresh_token && { refresh_token: newToken.refresh_token },
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
})


app.post("/apikey/connect/:serviceName", async (req, res) => {

    if (!req.body.teamId || !req.body.apiKey)
        return res.status(400).send("Missing parameters")

    const baseConfig = resolveIntegration(req.params.serviceName)?.apiKey
    if (!baseConfig)
        return res.status(404).send("Service not found")

    const config = merge({}, defaultConfig, baseConfig)

    const token = req.header("authorization")?.split("Bearer ")[1]
    if (!token)
        return res.status(400).send("Missing token")

    const { data: { user } } = await client.auth.getUser(token)

    if (!isUserEditorForTeam(user.id, req.body.teamId))
        return res.status(403).send("User is not an editor for the team")

    const profile = await fetchProfile(config.profileUrl, req.body.apiKey)

    try {
        const { data: { id: newAccountId } } = await client
            .from("integration_accounts")
            .insert({
                service_name: req.params.serviceName,
                display_name: config.getDisplayName(profile, { access_token: req.body.apiKey }),
                service_user_id: createHash("sha256").update(req.body.apiKey).digest("hex"),
                access_token: req.body.apiKey,
                profile,
            })
            .select("id")
            .single()
            .throwOnError()

        await addAccountToTeam(newAccountId, req.body.teamId)
    }
    catch (err) {
        console.error(err)
        return res.status(500).send("Failed to connect account")
    }

    res.status(204).send()
})


// Create workflow run
app.post("/workflows/:workflowId/run", async (req, res) => {

    const { data: { count } } = await client
        .from("workflow_runs")
        .select("count")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
        .throwOnError()

    const { data: { id: newRunId } } = await client
        .from("workflow_runs")
        .insert({
            workflow_id: req.params.workflowId,
            trigger_data: req.body.triggerData,
            count: (count || 0) + 1,
            ...req.body.scheduledFor && {
                status: "scheduled",
                scheduled_for: req.body.scheduledFor,
            }
        })
        .select("id")
        .single()
        .throwOnError()

    const taskParent = `projects/${projectId}/locations/us-central1/queues/workflow-runs/tasks`

    await fetch(`https://cloudtasks.googleapis.com/v2beta3/${taskParent}`, {
        method: "post",
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            task: {
                name: `${taskParent}/${newRunId}`,
                httpRequest: {
                    url: `${process.env.WORKFLOW_MAN_URL}/workflow-runs/${newRunId}/execute`,
                },
                ...req.body.scheduledFor && {
                    scheduleTime: {
                        seconds: Math.floor(new Date(req.body.scheduledFor).getTime() / 1000),
                        nanos: 0,
                    }
                }
            }
        }),
    })
        .then(res => res.json())
        .then(res => res.error ? Promise.reject(res.error) : res)

    // TO DO: optionally ?subscribe to created document and send response to client

    res.status(201).send({ id: newRunId })
})


app.all("/workflows/:workflowId/trigger/request", async (req, res) => {
    // TO DO: verify trigger type 

    await fetch(`${process.env.API_SERVER_URL}/workflows/${req.params.workflowId}/run`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            triggerData: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: typeof req.body === "object" ? JSON.stringify(req.body) : req.body,
                params: req.query,
            },
        })
    })


    res.sendStatus(201)
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

interface CustomSessionData {
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


async function checkForErrorThenJson(res: Response) {
    if (!res.ok) {
        console.debug(res)
        console.debug(`Body:\n${await res.text()}`)
        throw new Error(`Failed to fetch: ${res.statusText}`)
    }
    return res.json()
}


async function fetchProfile(profileUrl: string, accessToken: string) {
    return fetch(profileUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then(checkForErrorThenJson)
}