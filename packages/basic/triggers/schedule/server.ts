import type { ServerTriggerDefinition, WorkflowTrigger } from "@types"
import type shared from "./shared.js"
import _ from "lodash"
import { google } from "googleapis"
import { getAuth, parent } from "@pkg/server-util/google"


export default {
    onChange: handleScheduleChange,
} satisfies ServerTriggerDefinition<typeof shared>


async function handleScheduleChange(oldTrigger: ScheduleTrigger, newTrigger: ScheduleTrigger, workflowId: string) {

    const oldJobMap = Object.fromEntries(oldTrigger?.config?.intervals?.map(interval => [interval.id, interval]) ?? [])
    const newJobMap = Object.fromEntries(newTrigger?.config?.intervals?.map(interval => [interval.id, interval]) ?? [])

    const oldJobIds = Object.keys(oldJobMap)
    const newJobIds = Object.keys(newJobMap)

    const jobsToDelete = oldJobIds.filter(id => !newJobIds.includes(id))
    const jobsToAdd = newJobIds.filter(id => !oldJobIds.includes(id))
    const jobsToUpdate = oldJobIds.filter(id => newJobIds.includes(id) && !_.isEqual(oldJobMap[id], newJobMap[id]))

    const scheduler = google.cloudscheduler({
        version: "v1",
        auth: getAuth(),
    })

    const deletePromises = jobsToDelete.map(
        async id => scheduler.projects.locations.jobs.delete({
            name: parent(`jobs/${safeId(id)}`)
        })
    )

    const addPromises = jobsToAdd.map(
        async id => scheduler.projects.locations.jobs.create({
            parent: parent(""),
            requestBody: {
                name: parent(`jobs/${safeId(id)}`),
                description: `Workflow: (${workflowId}), Schedule Interval: (${id})`,
                schedule: intervalToCron(newJobMap[id].value),
                httpTarget: {
                    uri: `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`,
                    httpMethod: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: Buffer.from(JSON.stringify({
                        triggerData: {},
                    })).toString("base64"),
                },
            }
        })
    )

    const updatePromises = jobsToUpdate.map(
        async id => scheduler.projects.locations.jobs.patch({
            name: parent(`jobs/${safeId(id)}`),
            requestBody: {
                schedule: intervalToCron(newJobMap[id].value),
            }
        })
    )

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


interface ScheduleTrigger extends WorkflowTrigger {
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