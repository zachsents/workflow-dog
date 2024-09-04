import { EVENT_QUEUE } from "api/lib/bullmq"
import { parseCronExpression } from "cron-schedule"
import { createHash } from "node:crypto"
import SuperJSON from "superjson"
import { z } from "zod"
import { createPackageHelper, uniformEventData } from "../../server-registry"


const helper = createPackageHelper("primitives")


helper.registerNodeDef("triggerData", {
    name: "Data from Trigger",
    action(inputs, ctx) {
        return { data: ctx.eventPayload[ctx.node.config.selectedInput] }
    },
})

helper.registerNodeDef("text", {
    name: "Text",
    action(inputs, ctx) {
        return { text: ctx.node.config.value?.toString() || "" }
    },
})

helper.registerNodeDef("number", {
    name: "Number",
    action(inputs, ctx) {
        const value = parseFloat(ctx.node.config.value as string)
        return { number: isNaN(value) ? null : value }
    },
})

helper.registerNodeDef("boolean", {
    name: "Boolean",
    action(inputs, ctx) {
        return { boolean: !!ctx.node.config.value }
    },
})


// #region Callable

const callableEventSource = helper.registerEventSource("callable", {
    name: "Callable Endpoint",
    generateEvents(req, source) {
        if (req.method.toUpperCase() !== "POST")
            return

        const parsedBody = req.body instanceof Buffer
            ? SuperJSON.stringify(SuperJSON.parse(req.body.toString("utf8")))
            : SuperJSON.stringify(null)

        return {
            events: uniformEventData(source, { dataIn: parsedBody }),
        }
    },
})

helper.registerEventType("callable", {
    name: "Callable",
    createEventSources({ workflowId }) {
        return [{
            id: "callable_" + workflowId,
            definitionId: callableEventSource.id,
        }]
    },
    generateRunsFromEvent(event) {
        return [event.data]
    },
})


// #region Webhook

const webhookEventSource = helper.registerEventSource("webhook", {
    name: "Webhook Endpoint",
    generateEvents(req, source) {
        if (req.method.toUpperCase() !== "POST")
            return

        const data = req.body instanceof Buffer
            ? JSON.parse(req.body.toString("utf8"))
            : null

        const params = Object.fromEntries<string>(
            Object.entries(req.query).map(([k, v]) => {
                if (typeof v === "string")
                    return [k, v] as const
                else if (Array.isArray(v))
                    return [k, v[0].toString()] as const
            }).filter(x => !!x)
        )

        return {
            events: uniformEventData(source, { data, params }),
        }
    },
})

helper.registerEventType("webhook", {
    name: "Webhook",
    createEventSources({ workflowId }) {
        return [{
            id: "webhook_" + workflowId,
            definitionId: webhookEventSource.id,
        }]
    },
    generateRunsFromEvent(event) {
        return [event.data]
    },
})


// #region HTTP Request

const httpRequestEventSource = helper.registerEventSource("httpRequest", {
    name: "HTTP Endpoint",
    generateEvents(req, source) {
        const pathSegments = req.path.split("/")
        const path = "/" + pathSegments.slice(pathSegments.indexOf(source.id) + 1).join("/")

        return {
            events: uniformEventData(source, {
                method: req.method.toUpperCase(),
                path,
                body: req.body instanceof Buffer ? req.body.toString("base64") : null,
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
            }),
        }
    },
})

helper.registerEventType("httpRequest", {
    name: "HTTP Request",
    async createEventSources({ workflowId }) {
        return [{
            id: "request_" + workflowId,
            definitionId: httpRequestEventSource.id,
        }]
    },
    generateRunsFromEvent(event) {
        return [event.data]
    },
})


// #region Schedule

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
        const { jobKey } = z.object({
            jobKey: z.string(),
        }).passthrough().parse(source.state)

        await EVENT_QUEUE.removeRepeatableByKey(jobKey)
    },
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
