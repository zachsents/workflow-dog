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

export async function setWorkflowName(workflowId: string, formData: FormData) {
    const supabase = supabaseServer()
    const query = await supabase
        .from("workflows")
        .update({ name: formData.get("workflowName") as string })
        .eq("id", workflowId)
        .select("name")
        .single()
        .throwOnError()

    console.debug(`Updated workflow name to "${formData.get("workflowName")}"! (ID: ${workflowId})`)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return query.data?.name
}