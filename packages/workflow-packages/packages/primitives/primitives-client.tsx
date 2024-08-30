import { zodResolver } from "@hookform/resolvers/zod"
import useResizeObserver from "@react-hook/resize-observer"
import { IconClock, IconExternalLink, IconHash, IconLink, IconPlus, IconRouteSquare2, IconTextSize, IconToggleLeftFilled, IconWebhook, IconX } from "@tabler/icons-react"
import { useMemo, useRef } from "react"
import { useController, useFieldArray, useForm, type Control } from "react-hook-form"
import { Link } from "react-router-dom"
import ScheduleInput, { type ScheduleInputMode } from "web/src/components/schedule-input"
import SpinningLoader from "web/src/components/spinning-loader"
import TI from "web/src/components/tabler-icon"
import { Button } from "web/src/components/ui/button"
import { Input } from "web/src/components/ui/input"
import { Switch } from "web/src/components/ui/switch"
import { Textarea } from "web/src/components/ui/textarea"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useCurrentWorkflow, usePreventUnloadWhileSaving } from "web/src/lib/hooks"
import { trpc } from "web/src/lib/trpc"
import { cn, t } from "web/src/lib/utils"
import { useValueType } from "workflow-types/react"
import { z } from "zod"
import { createPackageHelper } from "../../client-registry"
import { toast } from "sonner"


const helper = createPackageHelper("primitives")

// #region Node: Text
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

// #region Node: Number
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

// #region Node: Switch
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

// #region EventType: Callable
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
    },
    eventSourceCreation: "assigned",
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
    eventSourceCreation: "assigned",
    sourceComponent: ({ workflowId }) => {
        return (
            <div>
                {workflowId}
            </div>
        )
    }
})

// #region EventType: HTTP Request
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
    eventSourceCreation: "configured",
    sourceComponent: () => {
        const workflow = useCurrentWorkflow().data!
        return (
            <form onSubmit={ev => ev.preventDefault()}>
                <Input placeholder="**" />
                <p className="break-all text-xs font-mono">
                    https://run.workflow.dog/x/{workflow.project_id}
                </p>
            </form>
        )
    },
})

// #region EventType: Schedule
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
    eventSourceCreation: "configured",
    sourceComponent: ({ workflowId, eventSources }) => {

        const formValues = useMemo<ScheduleFormSchema>(() => ({
            schedules: eventSources.map(evSrc => ({
                mode: (evSrc.state as any)?.mode ?? "picker",
                cron: (evSrc.state as any)?.cron ?? "0 0 * * *",
                timezone: (evSrc.state as any)?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            }))
        }), [eventSources])

        const form = useForm({
            resolver: zodResolver(z.object({
                schedules: z.object({
                    mode: z.enum(["picker", "cron"]),
                    cron: z.string(),
                    timezone: z.string(),
                }).array().superRefine((value, ctx) => {
                    const unique = new Set<string>()
                    value.forEach((sch, i) => {
                        const str = sch.cron + sch.timezone
                        if (unique.has(str))
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: "Duplicate schedule",
                                path: [i],
                            })
                        else
                            unique.add(str)
                    })
                }),
            })),
            values: formValues,
            mode: "onChange",
            reValidateMode: "onChange",
        })
        const fieldArr = useFieldArray({
            control: form.control,
            name: "schedules",
        })

        const utils = trpc.useUtils()
        const updateEventSources = trpc.workflows.updateEventSources.useMutation()

        const handleSubmit = form.handleSubmit(async values => {
            await updateEventSources.mutateAsync({
                workflowId,
                eventSourceData: values,
            })
            await utils.workflows.byId.invalidate({ workflowId })
            toast.success("Schedule saved!")
        })

        usePreventUnloadWhileSaving(form.formState.isDirty || form.formState.isSubmitting)

        return (
            <form className="grid gap-8 pt-8 pb-24" onSubmit={handleSubmit}>
                {fieldArr.fields.map((item, i) =>
                    <WrappedScheduleInput
                        key={item.id} control={form.control}
                        index={i}
                        onDelete={() => fieldArr.remove(i)}
                    />
                )}

                {fieldArr.fields.length === 0 &&
                    <p className="text-xs text-muted-foreground text-center">
                        No schedules
                    </p>}

                <Button type="button"
                    size="sm" className="gap-2"
                    onClick={() => fieldArr.append({
                        mode: "picker",
                        cron: "0 9 * * *",
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    })}
                >
                    <TI><IconPlus /></TI>
                    Add Schedule
                </Button>

                {form.formState.isDirty &&
                    <div className="absolute z-[1] bottom-0 left-0 w-full grid grid-cols-2 p-2 gap-2 bg-white shadow-lg border-t">
                        <Button
                            type="button" variant="ghost" onClick={() => form.reset()}
                            disabled={form.formState.isSubmitting}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit" className="gap-2"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? <>
                                <SpinningLoader />
                                Saving
                            </> : <>
                                Save
                            </>}
                        </Button>
                    </div>}
            </form>
        )
    },
})

type ScheduleFormSchema = {
    schedules: {
        mode: ScheduleInputMode
        cron: string
        timezone: string
    }[]
}

function WrappedScheduleInput({ control, index, onDelete }: {
    control: Control<ScheduleFormSchema>
    index: number
    onDelete: () => void
}) {

    const { field: modeField, formState } = useController({
        control,
        name: `schedules.${index}.mode` as const,
    })

    const { field: cronField } = useController({
        control,
        name: `schedules.${index}.cron` as const,
    })

    const { field: timezoneField } = useController({
        control,
        name: `schedules.${index}.timezone` as const,
    })

    const error = formState.errors?.schedules?.[index]?.root?.message

    return (
        <div className="grid gap-2">
            <div className={cn(
                "border shadow-md rounded-md p-2 pb-4",
                error && "border-destructive"
            )}>
                {error && <p className="text-sm text-destructive mb-4 text-center bg-destructive/10 py-1 rounded-md">
                    {error}
                </p>}
                <ScheduleInput
                    label={`Schedule ${index + 1}`}
                    // mode={modeField.value}
                    mode="picker"
                    onModeChange={modeField.onChange}
                    value={cronField.value}
                    onValueChange={cronField.onChange}
                    timezone={timezoneField.value}
                    onTimezoneChange={timezoneField.onChange}
                />
            </div>
            <div className="grid grid-flow-col auto-cols-fr">
                <Button
                    variant="ghost" size="sm"
                    className="gap-2 font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete()}
                >
                    <TI><IconX /></TI>
                    Delete Schedule
                </Button>
            </div>
        </div>
    )
}