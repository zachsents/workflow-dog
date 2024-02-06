import { createClient } from "@supabase/supabase-js"
import { getSecret } from "./secrets.js"


export const client = createClient(process.env.SUPABASE_URL, await getSecret("SUPABASE_SERVICE_KEY"))


export async function upsertIntegrationAccount(accountData: any) {
    const { data } = await client.from("integration_accounts").upsert(accountData, {
        onConflict: "service_name, service_user_id",
    }).select("id").single().throwOnError()

    return data
}


export async function getIntegrationAccount(id: string) {
    const { data } = await client.from("integration_accounts")
        .select("*")
        .eq("id", id)
        .single()
        .throwOnError()

    return data
}


export async function addAccountToTeam(accountId: string, teamId: string) {
    await client.from("integration_accounts_teams").upsert({
        integration_account_id: accountId,
        team_id: teamId,
    }).throwOnError()
}


export async function isUserEditorForTeam(userId: string, teamId: string) {
    const conditions = await Promise.all([
        await client.rpc("is_user_on_team", {
            _user_id: userId,
            _team_id: teamId,
        }).then(res => res.data),

        await client.rpc('has_role', {
            _team_id: teamId,
            _user_id: userId,
            role: "editor",
        }).then(res => res.data)
    ])

    return conditions.every(Boolean)
}