import { z } from "zod"
import { getAuthenticatedClient } from "./db.js"
import type { Request, Response } from "express"
import { TriggerDefinitions } from "packages/server.js"
import type { WorkflowTrigger } from "packages/types.js"
import { mergeObjectsOverwriteArrays } from "./util.js"


export async function assignNewTrigger(req: Request, res: Response) {
    const validation = z.object({
        type: z.enum(TriggerDefinitions.ids as [string, ...string[]]),
        config: z.record(z.any()).optional(),
    }).safeParse(req.body)

    if (!validation.success) {
        res.status(400).send({ error: (validation as any).error })
        return
    }

    const anonClient = await getAuthenticatedClient(req)

    const { data: { trigger: oldTrigger } } = await anonClient
        .from("workflows")
        .select("trigger")
        .eq("id", req.params.workflowId)
        .single()
        .throwOnError()

    const newTrigger = validation.data

    if (oldTrigger?.type === newTrigger.type) {
        return res.status(400).send({
            error: "The new trigger is the same as the old trigger"
        })
    }

    await anonClient.from("workflows")
        .update({ trigger: newTrigger })
        .eq("id", req.params.workflowId)
        .throwOnError()

    const changeHandlers: Promise<void>[] = []

    const oldTriggerDefinition = TriggerDefinitions.get(oldTrigger?.type)

    if (oldTrigger && oldTriggerDefinition) {
        changeHandlers.push(
            oldTriggerDefinition.onChange?.(
                oldTrigger,
                null,
                req.params.workflowId
            )
        )
    }

    const newTriggerDefinition = TriggerDefinitions.get(newTrigger.type)

    if (newTrigger && newTriggerDefinition) {
        changeHandlers.push(
            newTriggerDefinition.onChange?.(
                null,
                newTrigger as WorkflowTrigger,
                req.params.workflowId
            )
        )
    }

    await Promise.all(changeHandlers)
    res.sendStatus(204)
}


export async function updateTriggerConfig(req: Request, res: Response) {

    const validation = z.object({
        config: z.record(z.any()),
    }).safeParse(req.body)

    if (!validation.success) {
        res.status(400).send({ error: (validation as any).error })
        return
    }

    const anonClient = await getAuthenticatedClient(req)

    const { data: { trigger: oldTrigger } } = await anonClient.from("workflows")
        .select("trigger")
        .eq("id", req.params.workflowId)
        .single()
        .throwOnError()

    if (!oldTrigger) {
        return res.status(404).send({ error: "Workflow trigger not found" })
    }

    const newTrigger = {
        ...oldTrigger,
        config: mergeObjectsOverwriteArrays(oldTrigger.config, validation.data.config),
    }

    await anonClient.from("workflows")
        .update({ trigger: newTrigger })
        .eq("id", req.params.workflowId)
        .throwOnError()

    console.debug(`Updated fields (${Object.keys(validation.data)}) in trigger config for workflow (${req.params.workflowId})`)

    const triggerDefinition = TriggerDefinitions.get(oldTrigger.type)

    if (!triggerDefinition)
        console.warn(`No trigger definition found for trigger type: ${oldTrigger.type}`)

    await triggerDefinition?.onChange?.(
        oldTrigger,
        newTrigger,
        req.params.workflowId
    )

    res.sendStatus(204)
}