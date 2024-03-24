"use server"

import { remapError, supabaseServer } from "@web/lib/server/supabase"
import { revalidatePath } from "next/cache"

export async function setWorkflowIsEnabled(workflowId: string, isEnabled: boolean) {
    console.debug(`${isEnabled ? "Enabling" : "Disabling"} workflow... (ID: ${workflowId})`)

    const query = await supabaseServer()
        .from("workflows")
        .update({ is_enabled: isEnabled })
        .eq("id", workflowId)
        .select("is_enabled")
        .single()

    const error = remapError(query, {
        "PGRST116": "You don't have permission."
    })
    if (error) return error

    console.debug(`${isEnabled ? "Enabled" : "Disabled"} workflow! (ID: ${workflowId})`)
    return {
        store: {
            path: ["workflows", workflowId, "is_enabled"],
            value: query.data!.is_enabled,
        }
    }
}


export async function deleteWorkflow(workflowId: string) {
    console.debug(`Deleting workflow... (ID: ${workflowId})`)

    const query = await supabaseServer()
        .from("workflows")
        .delete()
        .eq("id", workflowId)
        .select("id")
        .single()

    const error = remapError(query, {
        "PGRST116": "You don't have permission."
    })
    if (error) return error

    console.debug(`Deleted workflow! (ID: ${workflowId})`)
    revalidatePath(`/projects/[projectId]/workflows`, "page")
    return true
}


export async function renameWorkflow(workflowId: string, name: string) {
    console.debug(`Renaming workflow... (ID: ${workflowId})`)

    const query = await supabaseServer()
        .from("workflows")
        .update({ name })
        .eq("id", workflowId)
        .select("name")
        .single()

    const error = remapError(query, {
        "PGRST116": "You don't have permission."
    })
    if (error) return error

    console.debug(`Renamed workflow! (ID: ${workflowId})`)
    return {
        data: query.data!.name,
        store: {
            path: ["workflows", workflowId, "name"],
            value: query.data!.name,
        }
    }
}