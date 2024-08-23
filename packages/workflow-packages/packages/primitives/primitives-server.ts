import { db } from "api/lib/db"
import { createPackageHelper } from "../../server-registry"
import { z } from "zod"
import { createHash } from "node:crypto"

const helper = createPackageHelper("primitives")


/**
 * This is the most basic form of an event source, which are all just
 * webhooks with extra functionality. This one is just the webhook.
 */
const httpEndpointEventSource = helper.registerEventSource("httpEndpoint", {
    name: "HTTP Endpoint",
    async setup() { },
    async cleanup() { },
    async addEventTypes() { },
    async removeEventTypes() { },
})

helper.registerEventType("callable", {
    name: "Callable",
    createEventSources({ workflowId }) {
        return [{
            id: "callable_" + workflowId,
            definitionId: httpEndpointEventSource.id,
        }]
    },
})

helper.registerEventType("webhook", {
    name: "Webhook",
    createEventSources({ workflowId }) {
        return [{
            id: "webhook_" + workflowId,
            definitionId: httpEndpointEventSource.id,
        }]
    },
})

helper.registerEventType("httpRequest", {
    name: "HTTP Request",
    async createEventSources({ workflowId }) {
        const { project_id } = await db.selectFrom("workflows")
            .select("project_id")
            .where("id", "=", workflowId)
            .executeTakeFirstOrThrow()

        return [{
            id: "request_" + project_id,
            definitionId: httpEndpointEventSource.id,
        }]
    },
})


const scheduleEventSource = helper.registerEventSource("schedule", {
    name: "Schedule",
    async setup(options) {
        // TODO: create actual cron job
    },
    async cleanup() {
        // TODO: delete cron job
    },
    async addEventTypes() { },
    async removeEventTypes() { },
})

helper.registerEventType("schedule", {
    name: "Schedule",
    createEventSources({ data }) {
        if (!data) return []

        const { schedules } = z.object({
            schedules: z.string().array(),
        }).parse(data)

        return schedules.map(schedule => ({
            id: createHash("md5").update(schedule).digest("hex"),
            definitionId: scheduleEventSource.id,
            state: { schedule },
        }))
    },
})

