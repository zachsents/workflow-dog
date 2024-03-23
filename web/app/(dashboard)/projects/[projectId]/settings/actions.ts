"use server"

import { remapError, supabaseServer } from "@web/lib/server/supabase"
import { generalSettingsSchema, type GeneralSettingsSchema } from "./schema"
import { revalidatePath } from "next/cache"

export async function updateGeneralSettings(projectId: string, values: GeneralSettingsSchema) {
    const parsedValues = await generalSettingsSchema.parseAsync(values)

    const query = await supabaseServer()
        .from("teams")
        .update({
            name: parsedValues.projectName,
        })
        .eq("id", projectId)
        .select("name")
        .single()

    const error = remapError(query, {
        "PGRST116": "You don't have permission."
    })
    if (error) return error

    console.debug(`Updated general settings for project "${projectId}"!`)

    // revalidatePath(`/projects/${projectId}/settings`)
    return {
        data: {
            projectName: query.data!.name,
        },
        store: {
            path: ["projects", projectId, "name"],
            value: query.data!.name,
        },
    }
}


export async function changeEditorRole(projectId: string, memberId: string, isEditor: boolean) {

    const query = await supabaseServer()
        .from("users_teams")
        .update({
            roles: isEditor ? ["viewer", "editor"] : ["viewer"],
        })
        .eq("user_id", memberId)
        .eq("team_id", projectId)
        .select("roles")
        .single()

    const error = remapError(query, {
        "PGRST116": "You don't have permission."
    })
    if (error) return error

    console.debug(`Changed role for member "${memberId}" in project "${projectId}"`)

    // revalidatePath(`/projects/${projectId}/settings`)
    return {
        store: {
            path: ["projects", projectId, "members", memberId, "isEditor"],
            value: query.data!.roles?.includes("editor") || false,
        }
    }
}


export async function removeMember(projectId: string, memberId: string) {

    const query = await supabaseServer()
        .from("users_teams")
        .delete()
        .eq("user_id", memberId)
        .eq("team_id", projectId)
        .select("user_id")
        .single()

    const error = remapError(query, {
        "PGRST116": "You don't have permission."
    })
    if (error) return error

    console.debug(`Removed member "${memberId}" from project "${projectId}"`)

    revalidatePath(`/projects/${projectId}/settings`)
    return true
}


export async function inviteMember(projectId: string, email: string) {

    const result = await supabaseServer().rpc("invite_user_to_team", {
        _email: email,
        _team_id: projectId,
    })

    const error = remapError(result, {
        "42703": "User doesn't have an account."
    })
    if (error) return error

    return true
}