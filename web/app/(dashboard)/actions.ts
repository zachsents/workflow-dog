"use server"

import { remapError, supabaseServer } from "@web/lib/server/supabase"
import { revalidatePath } from "next/cache"


/**
 * Server Action: Set Workflow Enabled State
 * ---
 * Sets the enabled state of a workflow using a boolean value.
 */
export async function setWorkflowIsEnabled(workflowId: string, isEnabled: boolean) {
    console.debug(`${isEnabled ? "Enabling" : "Disabling"} workflow... (ID: ${workflowId})`)

    const query = await supabaseServer()
        .from("workflows")
        .update({ is_enabled: isEnabled })
        .eq("id", workflowId)
        .select("is_enabled")
        .single()

    const error = remapError(query)
    if (error) return error

    console.debug(`${isEnabled ? "Enabled" : "Disabled"} workflow! (ID: ${workflowId})`)
    return {
        store: {
            path: ["workflows", workflowId, "is_enabled"],
            value: query.data!.is_enabled,
        }
    }
}


/**
 * Server Action: Delete Workflow
 * ---
 * Deletes a workflow.
 */
export async function deleteWorkflow(workflowId: string) {
    console.debug(`Deleting workflow... (ID: ${workflowId})`)

    const query = await supabaseServer()
        .from("workflows")
        .delete()
        .eq("id", workflowId)
        .select("id")
        .single()

    const error = remapError(query)
    if (error) return error

    console.debug(`Deleted workflow! (ID: ${workflowId})`)
    revalidatePath(`/projects/[projectId]/workflows`, "page")
    return true
}


/**
 * Server Action: Rename Workflow
 * ---
 * Renames a workflow. Returns the new name to help with form hook reset.
 */
export async function renameWorkflow(workflowId: string, name: string) {
    console.debug(`Renaming workflow... (ID: ${workflowId})`)

    const query = await supabaseServer()
        .from("workflows")
        .update({ name })
        .eq("id", workflowId)
        .select("name")
        .single()

    const error = remapError(query)
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