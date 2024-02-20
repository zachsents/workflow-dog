import { getAuthenticatedClient } from "@api/db.js"
import { fetchGoogleApi } from "@api/google.js"
import { mergeObjectsOverwriteArrays } from "@api/util.js"
import { Request, Response } from "express"
import isEqual from "lodash.isequal"
import { z } from "zod"


export async function put(req: Request, res: Response) {
    const validation = z.object({
        type: z.string().startsWith("trigger:"),
        config: z.record(z.any()).optional(),
    }).safeParse(req.body)

    if (!validation.success) {
        res.status(400).send({ error: (validation as any).error })
        return
    }

    const client = await getAuthenticatedClient(req)

    const { data: { trigger: oldTrigger } } = await client.from("workflows")
        .select("trigger")
        .eq("id", req.params.workflowId)
        .single()
        .throwOnError()

    const newTrigger = validation.data

    await client.from("workflows")
        .update({ trigger: newTrigger })
        .eq("id", req.params.workflowId)
        .throwOnError()

    await Promise.all([
        handleTriggerChange(req.params.workflowId, oldTrigger, null),
        handleTriggerChange(req.params.workflowId, null, newTrigger),
    ])

    res.sendStatus(204)
}


export async function patch(req: Request, res: Response) {

    const validation = z.object({
        config: z.record(z.any()),
    }).safeParse(req.body)

    if (!validation.success) {
        res.status(400).send({ error: (validation as any).error })
        return
    }

    const client = await getAuthenticatedClient(req)

    const { data: { trigger: oldTrigger } } = await client.from("workflows")
        .select("trigger")
        .eq("id", req.params.workflowId)
        .single()
        .throwOnError()

    const newTrigger = {
        ...oldTrigger,
        config: mergeObjectsOverwriteArrays(oldTrigger.config, validation.data.config),
    }

    await client.from("workflows")
        .update({ trigger: newTrigger })
        .eq("id", req.params.workflowId)
        .throwOnError()

    console.debug(`Updated fields (${Object.keys(validation.data)}) in trigger config for workflow (${req.params.workflowId})`)

    await handleTriggerChange(req.params.workflowId, oldTrigger, newTrigger)

    res.sendStatus(204)
}


async function handleTriggerChange(workflowId: string, oldTrigger: any, newTrigger: any) {
    const type = newTrigger?.type || oldTrigger?.type
    switch (type) {
        case "trigger:basic.schedule":
            await handleScheduleChange(workflowId, oldTrigger, newTrigger)
            break
    }
}


async function handleScheduleChange(workflowId: string, oldTrigger: ScheduleTrigger, newTrigger: ScheduleTrigger) {

    const oldJobMap = Object.fromEntries(oldTrigger?.config?.intervals?.map(interval => [interval.id, interval]) ?? [])
    const newJobMap = Object.fromEntries(newTrigger?.config?.intervals?.map(interval => [interval.id, interval]) ?? [])

    const oldJobIds = Object.keys(oldJobMap)
    const newJobIds = Object.keys(newJobMap)

    const jobsToDelete = oldJobIds.filter(id => !newJobIds.includes(id))
    const jobsToAdd = newJobIds.filter(id => !oldJobIds.includes(id))
    const jobsToUpdate = oldJobIds.filter(id => newJobIds.includes(id) && !isEqual(oldJobMap[id], newJobMap[id]))

    const deletePromises = jobsToDelete.map(async id => fetchGoogleApi({
        api: "cloudscheduler",
        version: "v1beta1",
        resourcePath: `jobs/${safeId(id)}`,
        method: "DELETE",
    }))

    const addPromises = jobsToAdd.map(async id => fetchGoogleApi({
        api: "cloudscheduler",
        version: "v1beta1",
        resourcePath: `jobs`,
        method: "POST",
    }, ({ fullResourcePath }) => ({
        name: `${fullResourcePath}/${safeId(id)}`,
        description: `Workflow: (${workflowId}), Schedule Interval: (${id})`,
        schedule: intervalToCron(newJobMap[id].value),
        httpTarget: {
            uri: `${process.env.API_SERVER_URL}/workflows/${workflowId}/run`,
            httpMethod: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: Buffer.from(JSON.stringify({
                triggerData: {},
            })).toString("base64"),
        },
    })))

    const updatePromises = jobsToUpdate.map(async id => fetchGoogleApi({
        api: "cloudscheduler",
        version: "v1beta1",
        resourcePath: `jobs/${safeId(id)}`,
        method: "PATCH",
        params: { updateMask: "schedule" },
    }, {
        schedule: intervalToCron(newJobMap[id].value),
    }))

    await Promise.all([
        ...deletePromises,
        ...addPromises,
        ...updatePromises,
    ].map(p => p.catch(console.error)))

    console.debug(`Deleted ${jobsToDelete.length} jobs, added ${jobsToAdd.length} jobs, and updated ${jobsToUpdate.length} jobs for workflow (${workflowId}) schedule trigger`)
}


function safeId(id: string) {
    return id.replaceAll(/\W+/g, "_")
}


function intervalToCron(interval: IntervalValue): string {
    const { quantity, unit, offsetMinutes, offsetDays, offsetWeekday, offsetTime } = interval

    const [hours, minutes] = offsetTime?.split(":").map(x => parseInt(x)) ?? []

    switch (unit) {
        case "minute":
            return `*/${quantity} * * * *`
        case "hour":
            return `${offsetMinutes} */${quantity} * * *`
        case "day":
            return `${minutes} ${hours} */${quantity} * *`
        case "week":
            return `${minutes} ${hours} * * ${offsetWeekday.toUpperCase()}`
        case "month":
            return `${minutes} ${hours} ${offsetDays} */${quantity} *`
    }
}


type ScheduleTrigger = {
    type: "trigger:basic.schedule"
    config: {
        intervals: {
            id: string
            value: IntervalValue
        }[]
        timezoneOffset: number
    }
}

type IntervalValue = {
    quantity: number
    unit: "minute" | "hour" | "day" | "week" | "month"
    offsetMinutes: number
    offsetDays: number
    offsetWeekday: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
    offsetTime: `${number}:${number}`
}