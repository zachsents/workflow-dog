import { EVENT_QUEUE } from "api/lib/bullmq"
import { parseCronExpression } from "cron-schedule"
import { createHash } from "node:crypto"
import { z } from "zod"
import { createPackage, uniformEventData } from "../../registry/registry.server"
import _mapValues from "lodash/mapValues"
import { decodeValue } from "../../lib/value-types.server"


const helper = createPackage("primitives")

// #region Nodes

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

helper.valueType("null", {
    name: "Empty",
    isApplicable: v => v == null,
})

helper.valueType("string", {
    name: "Text",
    isApplicable: v => typeof v === "string",
})

helper.valueType("number", {
    name: "Number",
    isApplicable: v => typeof v === "number",
})

helper.valueType("boolean", {
    name: "Boolean",
    isApplicable: v => typeof v === "boolean",
})

helper.valueType("object", {
    name: "Object",
    isApplicable: v => typeof v === "object" && v != null,
    toJSON: (v, encode) => _mapValues(v as object, encode),
    fromJSON: (v, decode) => _mapValues(v as object, decode),
})

helper.valueType("map", {
    name: "Map",
    isApplicable: v => v instanceof Map,
    toJSON: (v, encode) => {
        const map = v as Map<string, any>
        return Array.from(map.entries()).map(([k, v]) => [k, encode(v)] as const)
    },
    conversionPriority: 10,
    fromJSON: (v, decode) => {
        const entries = v as [string, any][]
        return new Map(entries.map(([k, v]) => [k, decode(v)] as const))
    },
})

helper.valueType("array", {
    name: "List",
    isApplicable: v => Array.isArray(v),
    toJSON: (v, encode) => (v as any[]).map(v => encode(v)),
    conversionPriority: 10,
    fromJSON: (v, decode) => (v as any[]).map(v => decode(v)),
})

helper.valueType("date", {
    name: "Date & Time",
    isApplicable: v => v instanceof Date,
    toJSON: v => (v as Date).toISOString(),
    conversionPriority: 10,
    fromJSON: v => new Date(v as string),
})



// #region Callable

const callableEventSource = helper.eventSource("callable", {
    name: "Callable Endpoint",
    generateEvents(req, source) {
        if (req.method.toUpperCase() !== "POST")
            return

        const parsedBody = req.body instanceof Buffer
            ? decodeValue(JSON.parse(req.body.toString("utf8")))
            : null

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

        const params = new Map(
            Object.entries(req.query)
                .map(([k, v]) => [k, v?.toString()] as const)
                .filter(([k, v]) => v != null)
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
                headers: new Map(
                    Object.entries(req.headers)
                        .map(([k, v]) => [k.toLowerCase(), v?.toString()] as const)
                        .filter(([k, v]) => v != null)
                ),
                query: new Map(
                    Object.entries(req.query)
                        .map(([k, v]) => [k, v?.toString()] as const)
                        .filter(([k, v]) => v != null)
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
