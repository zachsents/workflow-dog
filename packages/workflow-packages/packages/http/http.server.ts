import { z } from "zod"
import { createPackage, uniformEventData } from "../../registry/registry.server"


const helper = createPackage("http")


// #region Nodes

helper.node("respond", {
    name: "Respond",
    action(inputs, ctx) {
        const { status, body } = z.object({
            status: z.number().min(100).max(599).default(200),
            body: z.string(),
        }).parse(inputs)

        const contentType = z.string().regex(/^(?:\w+|\*)\/(?:\w+|\*)$/).parse(ctx.node.config.contentType)

        ctx.respond<HTTPResponse>({
            status, body,
            headers: {
                "Content-Type": contentType,
            },
        })
    },
    respondsToTriggerSynchronously: true,
})

helper.node("respondJson", {
    name: "Respond JSON",
    action(inputs, ctx) {
        const { status, body } = z.object({
            status: z.number().min(100).max(599).default(200),
            body: z.any().refine(v => v !== undefined, "Required"),
        }).parse(inputs)

        ctx.respond<HTTPResponse>({
            status,
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            },
        })
    },
    respondsToTriggerSynchronously: true,
})

helper.node("redirect", {
    name: "Redirect",
    action(inputs, ctx) {
        const { url, status } = z.object({
            status: z.number().min(300).max(399).default(302),
            url: z.string().url(),
        }).parse(inputs)

        ctx.respond({
            status,
            headers: {
                "Location": url,
            },
        })
    },
    respondsToTriggerSynchronously: true,
})


// #region Triggers

const requestEventSource = helper.eventSource("request", {
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
                ),
                query: Object.fromEntries(
                    Object.entries(req.query)
                        .map(([k, v]) => [k, v?.toString()] as const)
                        .filter(([k, v]) => v != null)
                ),
            }),
        }
    },
    handleResponse(res, {
        headers = {},
        status = 200,
        body,
    }: HTTPResponse) {
        Object.entries(headers).forEach(([k, v]) => res.header(k, v))

        if (body === undefined) res.sendStatus(status)
        else res.status(status).send(body ?? "")
    },
})

helper.eventType("request", {
    name: "HTTP Request",
    async createEventSources({ workflowId }) {
        return [{
            id: "request_" + workflowId,
            definitionId: requestEventSource.id,
        }]
    },
    generateRunsFromEvent(event) {
        return [event.data]
    },
})


const webhookEventSource = helper.eventSource("webhook", {
    name: "Webhook Endpoint",
    generateEvents(req, source) {
        if (req.method.toUpperCase() !== "POST")
            return

        const data = req.body instanceof Buffer
            ? JSON.parse(req.body.toString("utf8"))
            : null

        const params = Object.fromEntries(
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


type HTTPResponse = {
    status?: number
    body?: string
    headers?: Record<string, string>
}