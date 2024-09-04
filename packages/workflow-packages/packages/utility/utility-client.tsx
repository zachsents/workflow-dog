import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconArrowsJoin2, IconArrowsSplit2, IconMessage, IconSquare, IconTypography } from "@tabler/icons-react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import TI from "web/src/components/tabler-icon"
import { Textarea } from "web/src/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "web/src/components/ui/toggle-group"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { useValueType } from "workflow-types/react"
import { createPackageHelper } from "../../client-registry"
import { cn } from "web/src/lib/utils"


const helper = createPackageHelper("utility")

helper.registerNodeDef("ternary", {
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

helper.registerNodeDef("router", {
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

helper.registerNodeDef("passthrough", {
    name: "Passthrough",
    description: "Passes the input value through to the output. Mostly for testing.",
    icon: IconSquare,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="valueIn" displayName="Value" />
        <StandardNode.Handle type="output" name="valueOut" displayName="Value" />
    </StandardNode>,
})

helper.registerNodeDef("isNull", {
    name: "Is Null",
    description: "Checks if the input value is null.",
    icon: IconSquare,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="value" />
        <StandardNode.Handle
            type="output" name="isNull" displayName="Is Null"
            valueType={useValueType("boolean")}
        />
    </StandardNode>,
})

helper.registerNodeDef("comment", {
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
