import { createHash } from "crypto"
import type { Request, Response } from "express"
import merge from "lodash.merge"
import { ServiceDefinitions } from "packages/server.js"
import type { KeyConfig } from "packages/types.js"
import { addAccountToTeam, isUserEditorForTeam, client as supabase } from "./db.js"
import { checkForErrorThenJson } from "shared/requests.js"


export async function addApiKeyAccount(req: Request, res: Response) {
    if (!req.body.teamId || !req.body.apiKey)
        return res.status(400).send("Missing parameters")

    const service = ServiceDefinitions.resolve(req.params.serviceName)

    if (!service)
        return res.status(404).send("Service not found")

    const config = merge({}, defaultApiKeyAccountConfig, service.authAcquisition) as KeyConfig

    const userIdToken = req.header("authorization")?.split("Bearer ")[1]
    if (!userIdToken)
        return res.status(400).send("Missing token")

    const { data: { user } } = await supabase.auth.getUser(userIdToken)

    if (!isUserEditorForTeam(user.id, req.body.teamId))
        return res.status(403).send("User is not an editor for the team")

    let profileAuthHeader: string
    switch (service.authUsage.method) {
        case "basic":
            profileAuthHeader = `Basic ${Buffer.from(`${req.body.key}:`).toString("base64")}`
            break
        case "bearer":
            profileAuthHeader = `Bearer ${req.body.key}`
            break
        default:
            return res.status(500).send("Unsupported auth usage method")
    }

    const profile = await fetch(config.profileUrl, {
        headers: {
            Authorization: profileAuthHeader,
        },
    }).then(checkForErrorThenJson)

    const tokenObj = { key: req.body.apiKey }

    try {
        const { data: { id: newAccountId } } = await supabase
            .from("integration_accounts")
            .insert({
                service_id: service.id,
                service_user_id: createHash("sha256").update(req.body.apiKey).digest("hex"),
                display_name: config.getDisplayName(profile, tokenObj),
                profile,
                token: tokenObj,
            })
            .select("id")
            .single()
            .throwOnError()

        await addAccountToTeam(newAccountId, req.body.teamId)
        res.json({ success: true, account: newAccountId })
    }
    catch (err) {
        console.error(err)
        return res.status(500).send("Failed to connect account")
    }
}


const defaultApiKeyAccountConfig: Partial<KeyConfig> = {
    getDisplayName: (profile, token) => `${token.key.slice(0, 8)}... (${profile.email})`,
}