import { EVENT_QUEUE } from "api/lib/bullmq"
import { parseCronExpression } from "cron-schedule"
import { createHash } from "node:crypto"
import { z } from "zod"
import { createPackage, uniformEventData } from "../../registry/registry.server"


const helper = createPackage("primitives")

// #region Nodes

helper.node("triggerData", {
    name: "Data from Trigger",
    action(inputs, ctx) {
        return { data: ctx.eventPayload[ctx.node.config.selectedInput] }
    },
})

helper.node("text", {
    name: "Text",
    action(inputs, ctx) {
        return { text: ctx.node.config.value?.toString() || "" }
    },
})

helper.node("number", {
    name: "Number",
    action(inputs, ctx) {
        const value = parseFloat(ctx.node.config.value as string)
        return { number: isNaN(value) ? null : value }
    },
})

helper.node("boolean", {
    name: "Boolean",
    action(inputs, ctx) {
        return { boolean: !!ctx.node.config.value }
    },
})

helper.node("null", {
    name: "Null",
    action() {
        return { null: null }
    },
})


// #region Value Types

helper.valueType("any", {
    name: "Any",
})

helper.valueType("unknown", {
    name: "Unknown",
})

// WILO: adding parsing on the server side to interpret trigger data

helper.valueType("null", {
    name: "Empty",
    isApplicable: v => v == null,
    toJSON: () => null,
})

helper.valueType("string", {
    name: "Text",
    isApplicable: v => typeof v === "string",
    toJSON: v => v,
})

helper.valueType("number", {
    name: "Number",
    isApplicable: v => typeof v === "number",
    toJSON: v => v,
})

helper.valueType("boolean", {
    name: "Boolean",
    isApplicable: v => typeof v === "boolean",
    toJSON: v => v,
})

helper.valueType("object", {
    name: "Object",
    isApplicable: v => typeof v === "object" && v != null,
    toJSON: (v, toJSON) => Object.fromEntries(Object.entries(v as object).map(([k, v]) => [k, toJSON(v)] as const)),
})

helper.valueType("map", {
    name: "Map",
    isApplicable: v => v instanceof Map,
    toJSON: (v, toJSON) => {
        const map = v as Map<string, any>
        return Array.from(map.entries()).map(([k, v]) => [k, toJSON(v)] as const)
    },
    conversionPriority: 10,
})

helper.valueType("array", {
    name: "List",
    isApplicable: v => Array.isArray(v),
    toJSON: (v, toJSON) => (v as any[]).map(v => toJSON(v)),
    conversionPriority: 10,
})

helper.valueType("date", {
    name: "Date & Time",
    isApplicable: v => v instanceof Date,
    toJSON: v => (v as Date).toISOString(),
    conversionPriority: 10,
})




// #region Callable

const callableEventSource = helper.eventSource("callable", {
    name: "Callable Endpoint",
    generateEvents(req, source) {
        if (req.method.toUpperCase() !== "POST")
            return

        const parsedBody = req.body instanceof Buffer ? req.body.toString("utf8") : null

        return {
            events: uniformEventData(source, { dataIn: parsedBody }),
        }
    },
})

helper.eventType("callable", {
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

const webhookEventSource = helper.eventSource("webhook", {
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

helper.eventType("webhook", {
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

const httpRequestEventSource = helper.eventSource("httpRequest", {
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

helper.eventType("httpRequest", {
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

const scheduleEventSource = helper.eventSource("schedule", {
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
            events: uniformEventData(source, {
                timestamp: new Date(),
                // TODO: figure out how to serialize data here -- workers convert to JSON
            }),
        }
    },
})

helper.eventType("schedule", {
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
