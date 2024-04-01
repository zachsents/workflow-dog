"use server"

import { remapError, supabaseServer } from "@web/lib/server/supabase"
import { createHash } from "crypto"
import _ from "lodash"
import { ServiceDefinitions, TriggerDefinitions } from "packages/server"
import type { KeyConfig, WorkflowTrigger } from "packages/types"
import { z } from "zod"


/**
 * Server Action: Assign New Trigger
 * ---
 * Sets a new trigger for a workflow, cleaning up the old one
 * and setting up the new one.
 */
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

const triggerSchema = z.object({
    type: z.enum(TriggerDefinitions.ids as [string, ...string[]]),
    config: z.record(z.any()).optional(),
})

type TriggerSchema = z.infer<typeof triggerSchema>


/**
 * Server Action: Update Trigger Config
 * ---
 * Updates the configuration of a trigger for a workflow.
 */
export async function updateTriggerConfig(workflowId: string, update: TriggerUpdateSchema) {
    const validation = triggerUpdateSchema.safeParse(update)

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

    const oldTrigger = query.data?.trigger as WorkflowTrigger

    const newTrigger = {
        ...oldTrigger,
        config: mergeObjectsOverwriteArrays(
            oldTrigger.config,
            validation.data.config
        ),
    } as WorkflowTrigger

    const updateQuery = await supabase
        .from("workflows")
        .update({ trigger: newTrigger })
        .eq("id", workflowId)
        .select("id")
        .single()

    error = remapError(updateQuery)
    if (error) return error

    console.debug(`Updated fields (${Object.keys(validation.data)}) in trigger config for workflow (${workflowId})`)

    const triggerDefinition = TriggerDefinitions.get(oldTrigger.type)

    if (!triggerDefinition)
        console.warn(`No trigger definition found for trigger type: ${oldTrigger.type}`)

    await triggerDefinition?.onChange?.(
        oldTrigger,
        newTrigger,
        workflowId
    )

    return true
}

const triggerUpdateSchema = z.object({
    config: z.record(z.any()),
})

type TriggerUpdateSchema = z.infer<typeof triggerUpdateSchema>

function mergeObjectsOverwriteArrays(a: any, b: any) {
    return _.mergeWith({}, a, b, (objValue, srcValue) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue))
            return srcValue
    })
}


/**
 * Server Action: Add API Key Account
 * ---
 * Adds an API key account and attaches it to a project.
 */
export async function addApiKeyAccount(projectId: string, serviceId: string, key: string) {

    const service = ServiceDefinitions.get(serviceId)

    if (!service)
        return { error: { message: "Service not found" } }

    const config = _.merge({},
        defaultApiKeyAccountConfig,
        service.authAcquisition
    ) as KeyConfig

    const supabase = supabaseServer()

    let profileAuthHeader: string
    switch (service.authUsage.method) {
        case "basic":
            profileAuthHeader = `Basic ${Buffer.from(`${key}:`).toString("base64")}`
            break
        case "bearer":
            profileAuthHeader = `Bearer ${key}`
            break
        default:
            return { error: { message: "Unsupported auth usage method" } }
    }

    const profileFetch = await fetch(config.profileUrl, {
        headers: {
            Authorization: profileAuthHeader,
        },
    })

    if (!profileFetch.ok)
        return { error: { message: "Failed to fetch profile. This could mean the API key is invalid." } }

    const profile = await profileFetch.json()
    const tokenObj = { key }

    const insertQuery = await supabase
        .from("integration_accounts")
        .upsert({
            service_id: service.id,
            service_user_id: createHash("sha256").update(key).digest("hex"),
            display_name: config.getDisplayName!(profile, tokenObj),
            profile,
            token: tokenObj,
            creator: await supabase.auth.getUser().then(u => u.data.user?.id)
        }, {
            onConflict: "service_id, service_user_id",
        })
        .select("id")
        .single()

    let error = remapError(insertQuery)
    if (error) return error

    const joinQuery = await supabase.from("integration_accounts_teams").upsert({
        integration_account_id: insertQuery.data?.id!,
        team_id: projectId,
    })

    error = remapError(joinQuery, {
        "42501": "Account is already connected to this project",
        "23505": "Account is already connected to this project",
    })
    if (error) return error

    return {
        success: true,
        account: insertQuery.data?.id!,
    }
}

const defaultApiKeyAccountConfig: Partial<KeyConfig> = {
    getDisplayName: (profile, token) => `${token.key.slice(0, 8)}... (${profile.email})`,
}