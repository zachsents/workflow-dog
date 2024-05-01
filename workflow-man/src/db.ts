import { createClient, type SupabaseClient } from "@supabase/supabase-js"


export const client: SupabaseClient<any, "public", any> = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)


export async function updateRun(runId: string, data: any) {
    await client
        .from("workflow_runs")
        .update(data)
        .eq("id", runId)
        .throwOnError()
}


export async function updateAsRunning(runId: string, workflowId: string) {
    await Promise.all([
        client
            .from("workflow_runs")
            .update({
                status: "running",
                started_at: new Date().toISOString(),
            })
            .eq("id", runId)
            .throwOnError(),
        client
            .from("workflows")
            .update({
                last_ran_at: new Date().toISOString(),
            })
            .eq("id", workflowId)
            .throwOnError(),
    ])
}


export async function fetchIntegrationToken(accountId: string) {

    // console.log("Fetching token:", `${process.env.API_SERVER_URL}/accounts/${accountId}/token`)

    const response = await fetch(`${process.env.API_SERVER_URL}/accounts/${accountId}/token`, {
        headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`
        }
    }).then(res => {
        if (!res.ok)
            throw new Error(res.statusText)
        return res.json()
    })

    // console.log("Token response:", response)

    return response
}