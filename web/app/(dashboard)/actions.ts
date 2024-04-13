"use server"

import { remapError, supabaseServer, supabaseServerAdmin } from "@web/lib/server/supabase"
import { revalidatePath } from "next/cache"
import { TriggerDefinitions } from "packages/server"


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
 * Server Action: Create Workflow
 * ---
 * Creates a new workflow.
 */
export async function createWorkflow(projectId: string, name: string) {
    console.debug(`Creating workflow...`)

    const supabase = supabaseServer()
    const userId = await supabase.auth.getUser().then(u => u.data.user?.id)

    const query = await supabase
        .from("workflows")
        .insert({
            name,
            team_id: projectId,
            is_enabled: false,
            creator: userId,
        })
        .select("id")
        .single()

    const error = remapError(query)
    if (error) return error

    console.debug(`Created workflow! (ID: ${query.data!.id})`)
    revalidatePath(`/projects/[projectId]/workflows`, "page")
    return {
        id: query.data!.id,
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
        .select("id, trigger")
        .single()

    const error = remapError(query)
    if (error) return error

    const oldTrigger = query.data?.trigger as any
    if (oldTrigger?.type) {
        await TriggerDefinitions.get(oldTrigger.type)
            ?.onChange?.(oldTrigger, null, workflowId)
    }

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


/**
 * Server Action: Create Project
 * ---
 * Creates a new project (formerly known as a "team").
 */
export async function createProject(name: string) {

    const supabase = supabaseServer()
    const userId = await supabase.auth.getUser().then(u => u.data.user?.id)

    if (!userId)
        return { error: { message: "User not found" } }

    const insertQuery = await supabase
        .from("teams")
        .insert({
            name,
            creator: userId,
            is_personal: false,
        })
        .select("id")
        .single()

    let error = remapError(insertQuery)
    if (error) return error

    const supabaseAdmin = await supabaseServerAdmin()

    const joinQuery = await supabaseAdmin
        .from("users_teams")
        .insert({
            team_id: insertQuery.data!.id,
            user_id: userId!,
            roles: ["editor", "viewer"],
        })

    error = remapError(joinQuery)
    if (error) return error

    revalidatePath("/projects", "layout")
    return {
        id: insertQuery.data!.id,
    }
}