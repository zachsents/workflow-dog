import useResizeObserver from "@react-hook/resize-observer"
import { IconBook, IconBox, IconBracketsContain, IconClock, IconExternalLink, IconHash, IconLink, IconQuestionMark, IconRouteSquare2, IconRun, IconSquare, IconSquareAsteriskFilled, IconTextSize, IconToggleLeftFilled, IconWebhook } from "@tabler/icons-react"
import { useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import CopyButton from "web/src/components/copy-button"
import TI from "web/src/components/tabler-icon"
import { Button } from "web/src/components/ui/button"
import { DropdownMenuItem } from "web/src/components/ui/dropdown-menu"
import { Input } from "web/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web/src/components/ui/select"
import { Switch } from "web/src/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "web/src/components/ui/table"
import { Textarea } from "web/src/components/ui/textarea"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useCurrentWorkflow } from "web/src/lib/hooks"
import { t } from "web/src/lib/utils"
import { ClientEventTypes, ClientValueTypes } from "../../client"
import { useValueType, ValueDisplay } from "../../lib/value-types.client"
import { createPackage } from "../../registry/registry.client"
import ScheduleConfig from "./components/schedule-config"
import ValueDisplayBlock from "./components/value-display-block"


const helper = createPackage("primitives")

// #region Nodes

helper.node("triggerData", {
    name: "Data from Trigger",
    description: "The data passed to this workflow from the trigger.",
    icon: IconRun,
    component: () => {
        const eventTypeId = useCurrentWorkflow().data!.trigger_event_type_id
        const eventType = ClientEventTypes[eventTypeId]

        const gbx = useGraphBuilder()
        const nodeId = useNodeId()

        const selectedInput = gbx.useNodeState<string | null | undefined>(nodeId, n => n.config.selectedInput)
        const setSelectedInput = (value: string) => void gbx.mutateNodeState(nodeId, n => {
            n.config.selectedInput = value || null
        })

        // TODO: add side effect that checks if trigger has been changed and resets

        return (
            <StandardNode hidePackageBadge>
                {selectedInput
                    ? <StandardNode.Handle
                        type="output" name="data" displayName=" "
                        valueType={eventType.workflowInputs[selectedInput!].valueType}
                    />
                    : null}
                <StandardNode.Content>
                    <Select value={selectedInput ?? ""} onValueChange={setSelectedInput}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Pick a property">
                                {eventType?.workflowInputs[selectedInput!]?.displayName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(eventType.workflowInputs).map(([inputId, inputDef]) =>
                                <SelectItem key={inputId} value={inputId}>
                                    <p>{inputDef.displayName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {inputDef.valueType
                                            ? ClientValueTypes[inputDef.valueType.typeDefinitionId].name
                                            : "Any"}
                                    </p>
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.node("text", {
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

helper.node("number", {
    name: "Number",
    description: "A number.",
    icon: IconHash,
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()
        const value = gbx.useNodeState<string>(nodeId, n => n.config.value ?? "")

        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle type="output" name="number" valueType={useValueType("number")} displayName=" " />
                <StandardNode.Content>
                    <Input
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={e => gbx.mutateNodeState(nodeId, n => {
                            n.config.value = e.currentTarget.value
                        })}
                        style={{
                            width: `calc(${Math.max(value.length, 1)}ch + 80px)`
                        }}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    />
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.node("boolean", {
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

helper.node("null", {
    name: "Null",
    description: "A null value.",
    icon: IconSquare,
    component: () => <StandardNode hidePackageBadge>
        <StandardNode.Handle type="output" name="null" />
    </StandardNode>,
})


// #region Value Types

helper.valueType("any", {
    name: "Any",
    description: "Could be anything.",
    icon: IconSquareAsteriskFilled,
    previewComponent: () => null,
    fullComponent: () => null,
})

helper.valueType("unknown", {
    name: "Unknown",
    description: "Could be anything.",
    icon: IconQuestionMark,
    previewComponent: () => null,
    fullComponent: () => null,
})

helper.valueType("null", {
    name: "Empty",
    description: "An empty value. Null. Nothing.",
    icon: IconSquare,
    previewComponent: () => <b className="font-mono">Empty</b>,
    fullComponent: () => <ValueDisplayBlock label="Null">Empty</ValueDisplayBlock>,
})

helper.valueType("string", {
    name: "Text",
    description: "A string of text.",
    icon: IconTextSize,
    previewComponent: ({ value }) => <p className="whitespace-pre max-w-[100px] flex ">
        "<span className="truncate">{value}</span>"
    </p>,
    fullComponent: ({ value }) => <ValueDisplayBlock label="Text">{value}</ValueDisplayBlock>,
})

helper.valueType("number", {
    name: "Number",
    description: "A number.",
    icon: IconHash,
    previewComponent: ({ value }) => <b className="font-mono">{value}</b>,
    fullComponent: ({ value }) => <ValueDisplayBlock label="Number">{value}</ValueDisplayBlock>,
})

helper.valueType("boolean", {
    name: "True/False",
    description: "A true or false value.",
    icon: IconToggleLeftFilled,
    previewComponent: ({ value }) => <b className="font-mono">{value ? "True" : "False"}</b>,
    fullComponent: ({ value }) => <ValueDisplayBlock label="Boolean">{value ? "True" : "False"}</ValueDisplayBlock>,
})

helper.valueType("object", {
    name: "Object",
    description: "An object containing arbitrary key-value pairs.",
    icon: IconBox,
    previewComponent: ({ value }) => <p className="text-xs font-bold">
        Object - {Object.keys(value).length} properties
    </p>,
    fullComponent: ({ value }) => <Table>
        <TableBody>
            {Object.entries(value).map(([k, v]) =>
                <TableRow key={k}>
                    <TableCell className="font-semibold text-sm">
                        {k}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                        <ValueDisplay encodedValue={v} mode="preview" />
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>,
})

helper.valueType("map", {
    name: "Map",
    description: "A map of key-value pairs with all values of the same type.",
    icon: IconBook,
    genericParams: 1,
    previewComponent: ({ value }) => <p className="text-xs font-bold">
        Map - {Object.keys(value).length} entries
    </p>,
    fullComponent: ({ value }) => <Table>
        <TableBody>
            {Object.entries(value).map(([k, v]) =>
                <TableRow key={k}>
                    <TableCell className="font-semibold text-sm">
                        {k}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                        <ValueDisplay encodedValue={v} mode="preview" />
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>,
})

helper.valueType("array", {
    name: "List",
    description: "An ordered list of values.",
    icon: IconBracketsContain,
    genericParams: 1,
    previewComponent: ({ value }: { value: any[] }) => <p className="text-xs font-bold">
        List - {value.length} entries
    </p>,
    fullComponent: ({ value }: { value: any[] }) => <Table>
        <TableBody>
            {value.map((v, i) =>
                <TableRow key={i}>
                    <TableCell className="font-semibold text-sm">
                        {i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                        <ValueDisplay encodedValue={v} mode="preview" />
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>,
})

helper.valueType("date", {
    name: "Date & Time",
    description: "A date and time.",
    icon: IconClock,
    previewComponent: ({ value }: { value: string }) => <p className="text-xs font-bold">
        {new Date(value).toLocaleString(undefined, {
            timeStyle: "short",
            dateStyle: "short",
        })}
    </p>,
    fullComponent: ({ value }: { value: Date }) => <ValueDisplayBlock label="Date & Time">
        {new Date(value).toLocaleString(undefined, {
            timeStyle: "long",
            dateStyle: "long",
        })}
    </ValueDisplayBlock>,
})


// #region EventType: Callable
helper.eventType("callable", {
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
            valueType: useValueType("any"),
        },
    },
    workflowOutputs: {
        dataOut: {
            displayName: "Data Out",
            description: "The data returned from this workflow. This will be available to the workflow that called it.",
            valueType: useValueType("any"),
        },
    },
    sourceComponent: () => {
        const workflow = useCurrentWorkflow().data
        return (
            <div>
                <p className="text-sm">
                    This workflow will run when you use a <a href="https://learn.workflow.dog/actions/run-workflow" target="_blank" className="font-bold text-primary inline-flex items-center gap-1 hover:underline">
                        Run Workflow
                        <TI><IconExternalLink /></TI>
                    </a> action in another workflow.
                </p>
                <Button asChild variant="link" className="inline-block px-0">
                    <Link to={t`/projects/${workflow?.project_id}/workflows/create` ?? "/workflows"}>
                        Create a new workflow
                    </Link>
                </Button>
            </div>
        )
    },
})

// #region EventType: Webhook
helper.eventType("webhook", {
    name: "Webhook",
    whenName: "When a webhook is received",
    icon: IconWebhook,
    color: "gray.800",
    description: "Triggers when a webhook is received. You'll be provided with a URL that you can use with any external service. Only accepts HTTP POST requests.",
    keywords: ["webhook", "http", "external", "service", "url"],
    workflowInputs: {
        data: {
            displayName: "Data",
            description: "The JSON data passed from the webhook.",
            valueType: useValueType("any"),
        },
        params: {
            displayName: "Parameters",
            description: "The parameters parsed from the webhook URL.",
            valueType: useValueType("map", [useValueType("string")]),
        },
    },
    sourceComponent: ({ workflowId }) => {
        const url = import.meta.env.DEV
            ? `http://localhost:8080/api/run/webhook_${workflowId}`
            : `https://run.workflow.dog/x/webhook_${workflowId}`

        return (
            <div className="grid gap-4">
                <p className="text-sm">
                    This is a unique URL that triggers this workflow. Copy it and paste it into any service that accepts webhooks.
                </p>
                <pre className="break-all whitespace-normal text-xs p-2 bg-gray-100 rounded-md">
                    {url}
                </pre>
                <CopyButton content={url} copyText="Copy URL" />
            </div>
        )
    },
    additionalDropdownItems: ({ workflowId }) => (
        <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(import.meta.env.DEV
                ? `http://localhost:8080/api/run/webhook_${workflowId}`
                : `https://run.workflow.dog/x/webhook_${workflowId}`)
        }}>
            <TI><IconLink /></TI>
            Copy webhook URL
        </DropdownMenuItem>
    ),
})

// #region EventType: HTTP Request
helper.eventType("httpRequest", {
    name: "HTTP Request",
    whenName: "When a HTTP request is received",
    icon: IconLink,
    color: "gray.800",
    description: "Triggers when a HTTP request is received. You can specify a custom URL path, which can be shared between multiple workflows. Accepts common HTTP methods e.g. GET, POST, PUT, PATCH, DELETE, etc.",
    keywords: ["http", "request", "url", "path", "method"],
    workflowInputs: {
        path: {
            displayName: "Path",
            description: "The path on the URL that was called.",
            valueType: useValueType("string"),
        },
        method: {
            displayName: "Method",
            description: "The HTTP method that was called.",
            valueType: useValueType("string"),
        },
        body: {
            displayName: "Body",
            description: "The body of the request as a base64 encoded string.",
            valueType: useValueType("string"),
        },
        headers: {
            displayName: "Headers",
            description: "The headers of the request.",
            valueType: useValueType("map", [useValueType("string")]),
        },
        query: {
            displayName: "Query Parameters",
            description: "The query parameters of the request.",
            valueType: useValueType("map", [useValueType("string")]),
        },
    },
    sourceComponent: ({ workflowId }) => {
        const url = import.meta.env.DEV
            ? `http://localhost:8080/api/run/request_${workflowId}`
            : `https://run.workflow.dog/x/request_${workflowId}`

        return (
            <div className="grid gap-4">
                <p className="text-sm">
                    This is a unique URL that triggers this workflow. Copy it and use it for any HTTP request.
                </p>
                <pre className="break-all whitespace-normal text-xs p-2 bg-gray-100 rounded-md">
                    {url}
                </pre>
                <CopyButton content={url} copyText="Copy URL" />
            </div>
        )
    },
    additionalDropdownItems: ({ workflowId }) => (
        <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(import.meta.env.DEV
                ? `http://localhost:8080/api/run/request_${workflowId}`
                : `https://run.workflow.dog/x/request_${workflowId}`)
        }}>
            <TI><IconLink /></TI>
            Copy webhook URL
        </DropdownMenuItem>
    ),
})

// #region EventType: Schedule
helper.eventType("schedule", {
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
            valueType: useValueType("date"),
        },
    },
    requiresConfiguration: true,
    sourceComponent: ScheduleConfig,
})
