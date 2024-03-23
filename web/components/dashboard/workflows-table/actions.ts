"use server"

import { supabaseServer } from "@web/lib/server/supabase"

export async function setWorkflowIsEnabled(workflowId: string, isEnabled: boolean) {
    console.debug(`${isEnabled ? "Enabling" : "Disabling"} workflow... (ID: ${workflowId})`)

    const supabase = supabaseServer()
    const { data: { is_enabled } } = await supabase
        .from("workflows")
        .update({ is_enabled: isEnabled })
        .eq("id", workflowId)
        .select("is_enabled")
        .single()
        .throwOnError() as any

    console.debug(`${isEnabled ? "Enabled" : "Disabled"} workflow! (ID: ${workflowId})`)
    return is_enabled
}
