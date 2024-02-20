import { client } from "@api/db.js"
import { getSecret } from "@api/secrets.js"
import { checkForErrorThenJson, defaultOAuth2AccountConfig, fetchProfile, replaceExpiresIn } from "@api/util.js"
import { createClient } from "@supabase/supabase-js"
import { Request, Response } from "express"
import { resolve as resolveIntegration } from "integrations/server.js"
import merge from "lodash.merge"


export async function get(req: Request, res: Response) {

    const { data: { service_name } } = await client.from("integration_accounts")
        .select("service_name")
        .eq("id", req.params.accountId)
        .single()
        .throwOnError()

    const { authType } = resolveIntegration(service_name) ?? {}

    if (authType === "oauth2")
        return getTokenForOAuth2(req, res)
    if (authType === "apikey")
        return getTokenForApiKey(req, res)
    else
        return res.status(500).send("Unsupported auth type")
}


async function getTokenForApiKey(req: Request, res: Response) {
    const bearerKey = req.headers.authorization?.split("Bearer ")[1] || ""
    const requesterClient = createClient(process.env.SUPABASE_URL, bearerKey)

    const { data: { access_token } } = await requesterClient.from("integration_accounts")
        .select("access_token")
        .eq("id", req.params.accountId)
        .single()
        .throwOnError()

    res.send({ access_token })
}


async function getTokenForOAuth2(req: Request, res: Response) {

    const bearerKey = req.headers.authorization?.split("Bearer ")[1] || ""
    const requesterClient = createClient(process.env.SUPABASE_URL, bearerKey)

    const { data: { refresh_token, raw_token, service_name } } = await requesterClient.from("integration_accounts")
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
    const config = merge({}, defaultOAuth2AccountConfig, baseConfig)

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

        await requesterClient.from("integration_accounts")
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
}