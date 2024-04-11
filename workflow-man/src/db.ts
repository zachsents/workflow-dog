import { type SupabaseClient, createClient } from "@supabase/supabase-js"
import { getSecret } from "./secrets"


const serviceKey = await getSecret("SUPABASE_SERVICE_KEY")
export const client: SupabaseClient<any, "public", any> = createClient(process.env.SUPABASE_URL as string, serviceKey)


export async function updateRun(runId: string, data: any) {
    await client
        .from("workflow_runs")
        .update(data)
        .eq("id", runId)
        .throwOnError()
}


export async function fetchIntegrationToken(accountId: string) {

    // console.log("Fetching token:", `${process.env.API_SERVER_URL}/accounts/${accountId}/token`)

    const response = await fetch(`${process.env.API_SERVER_URL}/accounts/${accountId}/token`, {
        headers: {
            Authorization: `Bearer ${serviceKey}`
        }
    }).then(res => {
        if (!res.ok)
            throw new Error(res.statusText)
        return res.json()
    })

    // console.log("Token response:", response)

    return response
}