"use server"

import { supabaseServer } from "@web/lib/server/supabase"
import { generalSettingsSchema, type GeneralSettingsSchema } from "./schema"

export async function updateGeneralSettings(projectId: string, values: GeneralSettingsSchema) {

    const parsedValues = await generalSettingsSchema.parseAsync(values)

    const query = await supabaseServer()
        .from("teams")
        .update({
            name: parsedValues.projectName,
        })
        .eq("id", projectId)
        .select("projectName:name")
        .single()
        .throwOnError()

    console.debug(`Updated general settins for project "${projectId}"!`)

    return query.data
}