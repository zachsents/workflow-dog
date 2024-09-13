import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconArrowIteration, IconArrowsJoin2, IconArrowsSplit2, IconBraces, IconChartBar, IconEqual, IconMessage, IconPlayerPlay, IconSpeakerphone, IconSquare, IconTypography } from "@tabler/icons-react"
import TI from "web/src/components/tabler-icon"
import { Textarea } from "web/src/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "web/src/components/ui/toggle-group"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { cn } from "web/src/lib/utils"
import { useValueType } from "../../lib/value-types.client"
import { createPackage } from "../../registry/registry.client"
import OtherWorkflowsSelector from "./components/other-workflows-selector"
import { useCurrentWorkflow } from "web/src/lib/hooks"
import { ClientEventTypes } from "../../client"


const helper = createPackage("utility")

helper.node("ternary", {
    name: "Choose Value",
    description: "Chooses between two input values to output based on a condition.",
    icon: IconArrowsJoin2,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
        <StandardNode.Handle type="input" name="truthy" displayName="If True" />
        <StandardNode.Handle type="input" name="falsy" displayName="If False" />
        <StandardNode.Handle type="output" name="result" />
    </StandardNode>,
})

helper.node("router", {
    name: "Route Value",
    description: "Routes the input value to one of two outputs based on a condition.",
    icon: IconArrowsSplit2,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
        <StandardNode.Handle type="input" name="value" displayName="Value" />
        <StandardNode.Handle type="output" name="truthy" displayName="If True" />
        <StandardNode.Handle type="output" name="falsy" displayName="If False" />
    </StandardNode>,
})

helper.node("routerCase", {
    name: "Route Value by Case",
    description: "Routes the input value to one of many outputs based on which case it matches.",
    icon: IconArrowsSplit2,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
        <StandardNode.Handle type="input" name="value" displayName="Value" />
        <StandardNode.Handle type="output" name="truthy" displayName="If True" />
        <StandardNode.Handle type="output" name="falsy" displayName="If False" />
    </StandardNode>,
})

helper.node("passthrough", {
    name: "Passthrough",
    description: "Passes the input value through to the output. Mostly for testing.",
    icon: IconSquare,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="valueIn" displayName="Value" />
        <StandardNode.Handle type="output" name="valueOut" displayName="Value" />
    </StandardNode>,
})

helper.node("isNull", {
    name: "Is Null",
    description: "Checks if the input value is null.",
    icon: IconSquare,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="value" />
        <StandardNode.Handle
            type="output" name="isNull"
            valueType={useValueType("boolean")}
        />
    </StandardNode>,
})

helper.node("comment", {
    name: "Comment",
    description: "Displays a comment in the workflow. Purely cosmetic.",
    icon: IconMessage,
    color: "gray.400",
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()
        const { value: commentValue, align, size } = gbx.useNodeState(nodeId, n => n.config as {
            value: string
            align: CommentTextAlign
            size: CommentTextSize
        })
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Config<string> label="Comment Text">
                    {({ value, onChange }) => <Textarea
                        value={value ?? ""}
                        onChange={e => onChange(e.currentTarget.value)}
                        placeholder="Write your comment..."
                        onPointerDownCapture={e => e.stopPropagation()}
                        className="resize-none"
                    />}
                </StandardNode.Config>
                <StandardNode.Config<CommentTextAlign>
                    id="align" label="Text Align" defaultValue="center"
                >
                    {({ value, onChange }) =>
                        <ToggleGroup
                            type="single"
                            value={value!} onValueChange={(val: CommentTextAlign | "") => {
                                if (val) onChange(val)
                            }}
                            className="*:flex-center *:gap-2 grid grid-cols-3"
                        >
                            <ToggleGroupItem value="left">
                                <TI><IconAlignLeft /></TI>
                                Left
                            </ToggleGroupItem>
                            <ToggleGroupItem value="center">
                                <TI><IconAlignCenter /></TI>
                                Center
                            </ToggleGroupItem>
                            <ToggleGroupItem value="right">
                                <TI><IconAlignRight /></TI>
                                Right
                            </ToggleGroupItem>
                        </ToggleGroup>}
                </StandardNode.Config>

                <StandardNode.Config<CommentTextSize>
                    id="size" label="Text Size" defaultValue="sm"
                >
                    {({ value, onChange }) =>
                        <ToggleGroup
                            type="single"
                            value={value!} onValueChange={(val: CommentTextSize | "") => {
                                if (val) onChange(val)
                            }}
                            className="*:flex-center *:gap-2 grid grid-cols-3 *:no-shrink-children"
                        >
                            <ToggleGroupItem value="sm">
                                <TI className="text-xs"><IconTypography /></TI>
                                Small
                            </ToggleGroupItem>
                            <ToggleGroupItem value="md">
                                <TI className="text-md"><IconTypography /></TI>
                                Medium
                            </ToggleGroupItem>
                            <ToggleGroupItem value="lg">
                                <TI className="text-lg"><IconTypography /></TI>
                                Large
                            </ToggleGroupItem>
                        </ToggleGroup>}
                </StandardNode.Config>

                <StandardNode.Content>
                    {commentValue
                        ? <p
                            className={cn(
                                "max-w-[28ch] whitespace-pre-wrap",
                                size === "sm" ? "text-md"
                                    : size === "md" ? "text-xl"
                                        : size === "lg" ? "text-2xl" : null,
                            )}
                            style={{ textAlign: align }}
                        >
                            {commentValue}
                        </p>
                        : <p className="text-sm text-muted-foreground text-center">
                            No comment
                        </p>}
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

type CommentTextAlign = "left" | "center" | "right"
type CommentTextSize = "sm" | "md" | "lg"


helper.node("jsonParse", {
    name: "Parse JSON",
    description: "Parses a JSON string and outputs the corresponding value.",
    icon: IconBraces,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="json" displayName="JSON" valueType={useValueType("string")} />
        <StandardNode.Handle type="output" name="parsed" />
    </StandardNode>,
})

helper.node("jsonStringify", {
    name: "Convert to JSON",
    description: "Converts a value to a JSON string.",
    icon: IconBraces,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="value" />
        <StandardNode.Handle type="output" name="json" displayName="JSON" valueType={useValueType("string")} />
    </StandardNode>,
})

helper.node("coalesce", {
    name: "Coalesce",
    description: "Returns the first non-null value from the input.",
    icon: IconSquare,
    component: () => <StandardNode>
        <StandardNode.MultiHandle
            type="input" name="values" displayName="Values"
            itemDisplayName="Value"
            min={1} defaultAmount={2}
        />
        <StandardNode.Handle type="output" name="value" />
    </StandardNode>,
})

helper.node("triggerData", {
    name: "Trigger Data",
    description: "The data passed to this workflow from the trigger.",
    icon: IconChartBar,
    component: () => {
        const eventTypeId = useCurrentWorkflow().data!.trigger_event_type_id
        const eventType = ClientEventTypes[eventTypeId]

        return (
            <StandardNode hidePackageBadge>
                {Object.entries(eventType.workflowInputs).map(([inputId, inputDef]) =>
                    <StandardNode.Handle
                        key={inputId} name={inputId} type="output"
                        displayName={inputDef.displayName}
                        valueType={inputDef.valueType}
                    />
                )}
            </StandardNode>
        )
    },
})

helper.node("respond", {
    name: "Respond to Trigger",
    description: "Responds to the trigger that caused this workflow to run.",
    icon: IconSpeakerphone,
    component: () => {
        const eventTypeId = useCurrentWorkflow().data!.trigger_event_type_id
        const eventType = ClientEventTypes[eventTypeId]

        return (
            <StandardNode hidePackageBadge>
                {Object.entries(eventType.workflowOutputs).map(([outputId, outputDef]) =>
                    <StandardNode.Handle
                        key={outputId} name={outputId} type="input"
                        displayName={outputDef.displayName}
                        valueType={outputDef.valueType}
                    />
                )}
            </StandardNode>
        )
    },
})

helper.node("runWorkflow", {
    name: "Run Workflow",
    description: "Runs another workflow.",
    icon: IconPlayerPlay,
    color: "violet",
    component: () => {
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle type="input" name="payload" />
                <StandardNode.Handle type="output" name="result" />
                <StandardNode.Content>
                    <OtherWorkflowsSelector />
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.node("loopWorkflow", {
    name: "Loop Workflow",
    description: "Runs another workflow for every item in a list.",
    icon: IconArrowIteration,
    color: "violet",
    component: () => {
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.MultiHandle
                    type="input"
                    name="payloads" displayName="Payloads"
                    itemDisplayName="Payload"
                    defaultSingleMode
                />
                <StandardNode.MultiHandle
                    type="output"
                    name="results" displayName="Results"
                    itemDisplayName="Result"
                    defaultSingleMode
                />
                <StandardNode.Content>
                    <OtherWorkflowsSelector />
                </StandardNode.Content>
            </StandardNode>
        )
    },
})

helper.node("equals", {
    name: "Equals",
    description: "Checks if two values are equal.",
    icon: IconEqual,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="a" />
        <StandardNode.Handle type="input" name="b" />
        <StandardNode.Handle type="output" name="result" />
    </StandardNode>,
})