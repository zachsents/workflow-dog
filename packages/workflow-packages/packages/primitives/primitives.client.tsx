import useResizeObserver from "@react-hook/resize-observer"
import { useDebouncedCallback } from "@react-hookz/web"
import { IconAsteriskSimple, IconBox, IconBracketsContain, IconClock, IconExternalLink, IconHash, IconQuestionMark, IconRouteSquare2, IconSquare, IconTextSize, IconToggleLeftFilled } from "@tabler/icons-react"
import { useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import TI from "web/src/components/tabler-icon"
import { Button } from "web/src/components/ui/button"
import { Input } from "web/src/components/ui/input"
import { Switch } from "web/src/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "web/src/components/ui/table"
import { Textarea } from "web/src/components/ui/textarea"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useCurrentWorkflow } from "web/src/lib/hooks"
import { t } from "web/src/lib/utils"
import { useValueType, ValueDisplay } from "../../lib/value-types.client"
import { createPackage } from "../../registry/registry.client"
import ScheduleConfig from "./components/schedule-config"
import ValueDisplayBlock from "./components/value-display-block"


const helper = createPackage("primitives")

// #region Nodes

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
            return {
                width: c.textareaWidth as number | undefined,
                height: c.textareaHeight as number | undefined,
            }
        }, [])

        // limit constant state updates
        const setTextareaSize = useDebouncedCallback((entry: ResizeObserverEntry) => {
            try {
                gbx.mutateNodeState(nodeId, n => {
                    n.config.textareaWidth = Math.round(entry.borderBoxSize[0].inlineSize)
                    n.config.textareaHeight = Math.round(entry.borderBoxSize[0].blockSize)
                })
            } catch (err) {
                console.warn("Error resizing textarea. If this happened during deletion, it's expected.")
            }
        }, [gbx], 100)

        const resizeRef = useRef<HTMLTextAreaElement>(null)
        useResizeObserver(resizeRef, setTextareaSize)

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
    icon: IconAsteriskSimple,
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
    fullComponent: ({ value }) => <ValueDisplayBlock label="Text">
        {value || <span className="text-muted-foreground">&lt;empty&gt;</span>}
    </ValueDisplayBlock>,
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

            {Object.keys(value).length === 0 && <TableRow>
                <TableCell className="text-muted-foreground text-xs text-center">
                    No properties
                </TableCell>
            </TableRow>}
        </TableBody>
    </Table>,
})

helper.valueType("array", {
    name: "List",
    description: "An ordered list of values.",
    icon: IconBracketsContain,
    genericParams: 1,
    previewComponent: ({ value }: { value: any[] }) => <p className="text-xs font-bold">
        List - {value.length} items
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

            {value.length === 0 && <TableRow>
                <TableCell className="text-muted-foreground text-xs text-center">
                    No items
                </TableCell>
            </TableRow>}
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
    fullComponent: ({ value }: { value: string }) => <ValueDisplayBlock label="Date & Time">
        {new Date(value).toLocaleString(undefined, {
            timeStyle: "long",
            dateStyle: "long",
        })}
    </ValueDisplayBlock>,
})


// #region Triggers

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
            valueType: useValueType("unknown"),
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
