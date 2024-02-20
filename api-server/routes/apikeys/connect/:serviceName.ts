import { addAccountToTeam, client, isUserEditorForTeam } from "@api/db.js"
import { defaultOAuth2AccountConfig, fetchProfile } from "@api/util.js"
import { Request, Response } from "express"
import { resolve as resolveIntegration } from "integrations/server.js"
import merge from "lodash.merge"
import { createHash } from "node:crypto"


export async function post(req: Request, res: Response) {
    if (!req.body.teamId || !req.body.apiKey)
        return res.status(400).send("Missing parameters")

    const baseConfig = resolveIntegration(req.params.serviceName)?.apiKey
    if (!baseConfig)
        return res.status(404).send("Service not found")

    const config = merge({}, defaultOAuth2AccountConfig, baseConfig)

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
}