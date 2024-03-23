import type { TypedSupabaseClient } from "../types/supabase"


export function getWorkflowById(client: TypedSupabaseClient, workflowId: string) {
    return client
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .throwOnError()
        .single()
}

