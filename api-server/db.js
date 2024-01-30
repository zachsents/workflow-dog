import { createClient } from "@supabase/supabase-js"
import { getSecret } from "./secrets.js"


const client = createClient(process.env.SUPABASE_URL, await getSecret("SUPABASE_SERVICE_KEY"))


export async function upsertIntegrationAccount(serviceName, {
    displayName,
    accessToken,
    refreshToken,
    serviceUserId,
    profile,
    scopes,
} = {}) {
    const { data } = await client.from("integration_accounts").upsert({
        display_name: displayName,
        access_token: accessToken,
        refresh_token: refreshToken,
        service_user_id: serviceUserId,
        service_name: serviceName,
        profile,
        scopes,
    }, {
        onConflict: ["service_name", "service_user_id"],
    }).select("id").single().throwOnError()

    return data
}


export async function getIntegrationAccount(id) {
    const { data } = await client.from("integration_accounts")
        .select("*")
        .eq("id", id)
        .single()
        .throwOnError()

    return data
}


export async function addAccountToTeam(accountId, teamId) {
    await client.from("integration_accounts_teams").upsert({
        integration_account_id: accountId,
        team_id: teamId,
    }).throwOnError()
}