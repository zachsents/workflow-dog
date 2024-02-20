import { addAccountToTeam, upsertIntegrationAccount } from "@api/db.js"
import { getSecret } from "@api/secrets.js"
import { CustomSessionData, checkForErrorThenJson, defaultOAuth2AccountConfig, fetchProfile, redirectUri, replaceExpiresIn } from "@api/util.js"
import { Request, Response } from "express"
import { resolve as resolveIntegration } from "integrations/server.js"
import merge from "lodash.merge"


export async function get(req: Request, res: Response) {

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

    const config = merge({}, defaultOAuth2AccountConfig, baseConfig)

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
}