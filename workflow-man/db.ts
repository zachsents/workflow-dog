import { createClient } from "@supabase/supabase-js"
import { getSecret } from "./secrets.js"


export const client = createClient(process.env.SUPABASE_URL as string, await getSecret("SUPABASE_SERVICE_KEY"))


export async function updateRun(runId: string, data: any) {
    await client
        .from("workflow_runs")
        .update(data)
        .eq("id", runId)
        .throwOnError()
}