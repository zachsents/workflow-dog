import { db } from "api/lib/db"
import { createHash } from "node:crypto"
import SuperJSON from "superjson"
import { z } from "zod"
import { createPackageHelper } from "../../server-registry"
import { parseCronExpression } from "cron-schedule"
import { EVENT_QUEUE } from "api/lib/bullmq"


const helper = createPackageHelper("primitives")


/**
 * This is the most basic form of an event source, which are all just
 * webhooks with extra functionality. This one is just the webhook.
 */
const httpEndpointEventSource = helper.registerEventSource("httpEndpoint", {
    name: "HTTP Endpoint",
    setup() { },
    cleanup() { },
    addEventTypes() { },
    removeEventTypes() { },
    generateEvents(req, source) {

        const eventData: HttpEndpointEventData = {
            method: req.method.toUpperCase(),
            path: req.path,
            body: req.body instanceof Buffer ? req.body : null,
            headers: Object.fromEntries(
                Object.entries(req.headers)
                    .map(([k, v]) => [k.toLowerCase(), v?.toString()] as const)
                    .filter(([k, v]) => v != null)
            ) as Record<string, string>,
            query: Object.fromEntries<string | string[]>(
                Object.entries(req.query).map(([k, v]) => {
                    if (typeof v === "string")
                        return [k, v as string] as const
                    else if (Array.isArray(v))
                        return [k, v as string[]] as const
                }).filter(x => !!x)
            ),
        }

        return {
            events: source.enabled_event_types.map(type => ({
                type,
                data: eventData,
            }))
        }
    },
})

interface HttpEndpointEventData {
    method: string
    path: string
    headers: Record<string, string>
    query: Record<string, string | string[]>
    body: Buffer | null
}

helper.registerEventType("callable", {
    name: "Callable",
    createEventSources({ workflowId }) {
        return [{
            id: "callable_" + workflowId,
            definitionId: httpEndpointEventSource.id,
        }]
    },
    generateRunsFromEvent(event) {
        const eventData = event.data as HttpEndpointEventData
        if (eventData.method !== "POST")
            return

        const parsedBody = eventData.body
            ? SuperJSON.stringify(SuperJSON.parse(eventData.body!.toString("utf8")))
            : SuperJSON.stringify(null)

        return [parsedBody]
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
    generateRunsFromEvent(event) {
        const eventData = event.data as HttpEndpointEventData
        if (eventData.method !== "POST")
            return

        const parsedBody = eventData.body
            ? JSON.parse(eventData.body.toString("utf8"))
            : null

        return [{
            data: parsedBody,
            params: eventData.query,
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
    generateRunsFromEvent(event) {
        const { body, ...eventData } = event.data as HttpEndpointEventData
        const parsedBody = body?.toString("utf8") ?? null
        return [{
            ...eventData,
            body: parsedBody,
        }]
    },
})


const scheduleEventSource = helper.registerEventSource("schedule", {
    name: "Schedule",
    async setup(options) {
        const { cron, timezone } = z.object({
            cron: z.string().superRefine((value, ctx) => {
                try {
                    parseCronExpression(value)
                } catch (err: any) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: err.message,
                    })
                }
            }),
            timezone: z.string(),
        }).passthrough().parse(options.initializer.state)

        const job = await EVENT_QUEUE.add(options.initializer.id, {}, {
            repeat: {
                pattern: cron,
                tz: timezone,
            }
        })
        return { state: { jobKey: job.repeatJobKey } }
    },
    async cleanup(source) {
        const {jobKey} = z.object({
            jobKey: z.string(),
        }).passthrough().parse(source.state)

        await EVENT_QUEUE.removeRepeatableByKey(jobKey)
    },
    /** Doesn't need to be implemented */
    addEventTypes() { },
    /** Doesn't need to be implemented */
    removeEventTypes() { },
    generateEvents(req, source) {
        return {
            events: source.enabled_event_types.map(type => ({
                type,
                data: {},
            })),
        }
    },
})

helper.registerEventType("schedule", {
    name: "Schedule",
    createEventSources({ data }) {
        if (!data) return []

        const { schedules } = z.object({
            schedules: z.object({
                cron: z.string().superRefine((value, ctx) => {
                    try {
                        parseCronExpression(value)
                    } catch (err: any) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: err.message,
                        })
                    }
                }),
                mode: z.enum(["picker", "cron"]),
                timezone: z.enum(Intl.supportedValuesOf("timeZone") as [string, ...string[]]),
            }).array(),
        }).parse(data)

        return schedules.map(schedule => ({
            id: createHash("md5")
                .update(scheduleEventSource.id)
                .update(schedule.cron)
                .update(schedule.timezone)
                .digest("hex"),
            definitionId: scheduleEventSource.id,
            state: schedule,
        }))
    },
    generateRunsFromEvent(event) {
        return [event.data]
    },
})

