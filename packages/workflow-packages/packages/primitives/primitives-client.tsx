import useResizeObserver from "@react-hook/resize-observer"
import { IconClock, IconHash, IconLink, IconRouteSquare2, IconTextSize, IconToggleLeftFilled, IconWebhook } from "@tabler/icons-react"
import { useMemo, useRef } from "react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { Input } from "web/src/components/ui/input"
import { Switch } from "web/src/components/ui/switch"
import { Textarea } from "web/src/components/ui/textarea"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { useValueType } from "workflow-types/react"
import { createPackageHelper } from "../../client-registry"


const helper = createPackageHelper("primitives")


helper.registerNodeDef("text", {
    name: "Text",
    description: "Some fixed text.",
    icon: IconTextSize,
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()

        const value = gbx.useNodeState(nodeId, n => n.config.value ?? "")

        // only want to get it once initially
        const textareaSize = useMemo(() => {
            const c = gbx.state.nodes.get(nodeId)!.config
            return { width: c._textareaWidth as number, height: c._textareaHeight as number }
        }, [])

        const resizeRef = useRef<HTMLTextAreaElement>(null)
        useResizeObserver(resizeRef, entry => {
            try {
                gbx.mutateNodeState(nodeId, n => {
                    n.config._textareaWidth = Math.round(entry.borderBoxSize[0].inlineSize)
                    n.config._textareaHeight = Math.round(entry.borderBoxSize[0].blockSize)
                })
            } catch (err) {
                console.warn("Error resizing textarea. If this happened during deletion, it's expected.")
            }
        })

        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle type="output" name="text" valueType={useValueType("string")} displayName=" " />
                <StandardNode.Content>
                    <Textarea
                        value={value}
                        onChange={e => gbx.mutateNodeState(nodeId, n => n.config.value = e.currentTarget.value)}
                        placeholder="Type something..."
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="resize box-border"
                        style={textareaSize}
                        ref={resizeRef}
                    />
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.registerNodeDef("number", {
    name: "Number",
    description: "A number.",
    icon: IconHash,
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()
        const value = gbx.useNodeState<string>(nodeId, n => n.config.value ? `${n.config.value}` : "")

        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle type="output" name="number" valueType={useValueType("number")} displayName=" " />
                <StandardNode.Content>
                    <Input
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={e => gbx.mutateNodeState(nodeId, n => {
                            const parsed = parseFloat(e.currentTarget.value)
                            n.config.value = isNaN(parsed) ? null : parsed
                        })}
                        style={{
                            width: `calc(${value.length}ch + 80px)`
                        }}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    />
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.registerNodeDef("boolean", {
    name: "Switch",
    description: "A true or false value.",
    icon: IconToggleLeftFilled,
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()
        const value = gbx.useNodeState<boolean>(nodeId, n => n.config.value ?? false)
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle type="output" name="boolean" valueType={useValueType("boolean")} displayName=" " />
                <StandardNode.Content>
                    <Switch
                        checked={value}
                        onCheckedChange={v => gbx.mutateNodeState(nodeId, n => n.config.value = v)}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    />
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.registerEventType("callable", {
    name: "Callable",
    whenName: "When another workflow calls this one",
    icon: IconRouteSquare2,
    color: "violet",
    description: "Triggers when a workflow calls this one. You can use this to trigger a workflow from another workflow.",
    keywords: ["workflow", "call", "trigger", "run", "other"],
    workflowInputs: {
        dataIn: {
            displayName: "Data In",
            description: "The data passed to this workflow from the workflow that called it.",
            valueType: null,
        },
        dataOut: {
            displayName: "Data Out",
            description: "The data returned from this workflow. This will be available to the workflow that called it.",
            valueType: null,
        },
    }
})

helper.registerEventType("webhook", {
    name: "Webhook",
    whenName: "When a webhook is received",
    icon: IconWebhook,
    color: "gray.800",
    description: "Triggers when a webhook is received. You'll be provided with a URL that you can use with any external service. Only accepts HTTP POST requests.",
    keywords: ["webhook", "http", "external", "service", "url"],
    workflowInputs: {
        url: {
            displayName: "URL",
            description: "The URL that was called.",
            valueType: useValueType("string"),
        },
        method: {
            displayName: "Method",
            description: "The HTTP method that was called.",
            valueType: useValueType("string"),
        },
        body: {
            displayName: "Body",
            description: "The body of the request.",
            valueType: useValueType("string"),
        },
        headers: {
            displayName: "Headers",
            description: "The headers of the request.",
            valueType: useValueType("record", [useValueType("string")]),
        },
    },
})

helper.registerEventType("httpRequest", {
    name: "HTTP Request",
    whenName: "When a HTTP request is received",
    icon: IconLink,
    color: "gray.800",
    description: "Triggers when a HTTP request is received. You can specify a custom URL path, which can be shared between multiple workflows. Accepts common HTTP methods e.g. GET, POST, PUT, PATCH, DELETE, etc.",
    keywords: ["http", "request", "url", "path", "method"],
    workflowInputs: {
        url: {
            displayName: "URL",
            description: "The URL that was called.",
            valueType: useValueType("string"),
        },
        method: {
            displayName: "Method",
            description: "The HTTP method that was called.",
            valueType: useValueType("string"),
        },
        body: {
            displayName: "Body",
            description: "The body of the request.",
            valueType: useValueType("string"),
        },
        headers: {
            displayName: "Headers",
            description: "The headers of the request.",
            valueType: useValueType("record", [useValueType("string")]),
        },
    },
})

helper.registerEventType("schedule", {
    name: "Schedule",
    whenName: "On a schedule",
    icon: IconClock,
    color: "gray.800",
    description: "Triggers at a specific time.",
    keywords: ["time", "date", "timezone", "utc", "schedule"],
    workflowInputs: {
        timestamp: {
            displayName: "Timestamp",
            description: "The date & time at which the event occurred.",
            valueType: useValueType("timestamp"),
        },
    },
})