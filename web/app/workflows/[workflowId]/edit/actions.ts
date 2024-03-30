"use server"

import { remapError, supabaseServer } from "@web/lib/server/supabase"
import { TriggerDefinitions } from "packages/server"
import { z } from "zod"


const triggerSchema = z.object({
    type: z.enum(TriggerDefinitions.ids as [string, ...string[]]),
    config: z.record(z.any()).optional(),
})

type TriggerSchema = z.infer<typeof triggerSchema>

export async function assignNewTrigger(workflowId: string, newTrigger: TriggerSchema) {
    const validation = triggerSchema.safeParse(newTrigger)

    if (!validation.success)
        return { error: validation.error }

    const supabase = supabaseServer()

    const query = await supabase
        .from("workflows")
        .select("trigger")
        .eq("id", workflowId)
        .single()

    let error = remapError(query)
    if (error) return error

    const oldTrigger = query.data?.trigger as TriggerSchema | undefined
    newTrigger = validation.data

    if (oldTrigger?.type === newTrigger.type) {
        return {
            error: { message: "The new trigger is the same as the old trigger" }
        }
    }

    const updateQuery = await supabase
        .from("workflows")
        .update({ trigger: newTrigger })
        .eq("id", workflowId)
        .select("id")
        .single()

    error = remapError(updateQuery)
    if (error) return error

    // call onChange handlers in parallel
    await Promise.all([
        (async () => {
            if (oldTrigger?.type) {
                await TriggerDefinitions.get(oldTrigger.type)
                    ?.onChange?.(oldTrigger as any, null, workflowId)
            }
        })(),
        (async () => {
            if (newTrigger?.type) {
                await TriggerDefinitions.get(newTrigger.type)
                    ?.onChange?.(null, newTrigger as any, workflowId)
            }
        })(),
    ])

    return true
}