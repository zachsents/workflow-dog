"use server"

import { remapError, supabaseServer } from "@web/lib/server/supabase"
import { createHash } from "crypto"
import _ from "lodash"
import { ServiceDefinitions } from "packages/server"
import type { KeyConfig } from "packages/types"


/**
 * Server Action: Add API Key Account
 * ---
 * Adds an API key account and attaches it to a project.
 */
export async function addApiKeyAccount(projectId: string, serviceId: string, key: string) {

    const service = ServiceDefinitions.get(serviceId)

    if (!service)
        return { error: { message: "Service not found" } }

    const config = _.merge({},
        defaultApiKeyAccountConfig,
        service.authAcquisition
    ) as KeyConfig

    const supabase = supabaseServer()

    let profileAuthHeader: string
    switch (service.authUsage.method) {
        case "basic":
            profileAuthHeader = `Basic ${Buffer.from(`${key}:`).toString("base64")}`
            break
        case "bearer":
            profileAuthHeader = `Bearer ${key}`
            break
        default:
            return { error: { message: "Unsupported auth usage method" } }
    }

    const profileFetch = await fetch(config.profileUrl, {
        headers: {
            Authorization: profileAuthHeader,
        },
    })

    if (!profileFetch.ok)
        return { error: { message: "Failed to fetch profile. This could mean the API key is invalid." } }

    const profile = await profileFetch.json()
    const tokenObj = { key }

    const insertQuery = await supabase
        .from("integration_accounts")
        .upsert({
            service_id: service.id,
            service_user_id: createHash("sha256").update(key).digest("hex"),
            display_name: config.getDisplayName!(profile, tokenObj),
            profile,
            token: tokenObj,
            creator: await supabase.auth.getUser().then(u => u.data.user?.id)
        }, {
            onConflict: "service_id, service_user_id",
        })
        .select("id")
        .single()

    let error = remapError(insertQuery)
    if (error) return error

    const joinQuery = await supabase.from("integration_accounts_teams").upsert({
        integration_account_id: insertQuery.data?.id!,
        team_id: projectId,
    })

    error = remapError(joinQuery, {
        "42501": "Account is already connected to this project",
        "23505": "Account is already connected to this project",
    })
    if (error) return error

    return {
        success: true,
        account: insertQuery.data?.id!,
    }
}

const defaultApiKeyAccountConfig: Partial<KeyConfig> = {
    getDisplayName: (profile, token) => `${token.key.slice(0, 8)}... (${profile.email})`,
}