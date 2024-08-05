import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconArrowsJoin2, IconArrowsSplit2, IconMessage, IconSquare } from "@tabler/icons-react"
import { StandardNode } from "web/src/components/action-node"
import { useValueType } from "workflow-types/react"
import { clientNodeHelper, prefixDefinitionIds } from "../../helpers/react"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder"
import { Textarea } from "web/src/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "web/src/components/ui/toggle-group"
import TI from "web/src/components/tabler-icon"


const createDef = clientNodeHelper({})

export default prefixDefinitionIds("control", {
    ternary: createDef({
        name: "Choose Value",
        icon: IconArrowsJoin2,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
            <StandardNode.Handle type="input" name="truthy" displayName="If True" />
            <StandardNode.Handle type="input" name="falsy" displayName="If False" />
            <StandardNode.Handle type="output" name="result" />
        </StandardNode>,
    }),
    router: createDef({
        name: "Route Value",
        icon: IconArrowsSplit2,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
            <StandardNode.Handle type="input" name="value" displayName="Value" />
            <StandardNode.Handle type="output" name="truthy" displayName="If True" />
            <StandardNode.Handle type="output" name="falsy" displayName="If False" />
        </StandardNode>,
    }),
    passthrough: createDef({
        name: "Passthrough",
        icon: IconSquare,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="value" />
            <StandardNode.Handle type="output" name="value" />
        </StandardNode>,
    }),
    isNull: createDef({
        name: "Is Null",
        icon: IconSquare,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="value" />
            <StandardNode.Handle type="output" name="isNull" valueType={useValueType("boolean")} />
        </StandardNode>,
    }),
    comment: createDef({
        name: "Comment",
        icon: IconMessage,
        component: () => {
            const gbx = useGraphBuilder()
            const nodeId = useNodeId()
            const { value: commentValue, align } = gbx.useNodeState(nodeId, n => n.config)
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
                    <StandardNode.Config<TextAlign>
                        id="align" label="Text Align" defaultValue="left"
                    >
                        {({ value, onChange }) =>
                            <ToggleGroup
                                type="single"
                                value={value!} onValueChange={(val: TextAlign | "") => {
                                    if (val) onChange(val)
                                }}
                            >
                                <ToggleGroupItem value="left" className="flex-center gap-2">
                                    <TI><IconAlignLeft /></TI>
                                    Left
                                </ToggleGroupItem>
                                <ToggleGroupItem value="center" className="flex-center gap-2">
                                    <TI><IconAlignCenter /></TI>
                                    Center
                                </ToggleGroupItem>
                                <ToggleGroupItem value="right" className="flex-center gap-2">
                                    <TI><IconAlignRight /></TI>
                                    Right
                                </ToggleGroupItem>
                            </ToggleGroup>}
                    </StandardNode.Config>
                    <StandardNode.Content>
                        {commentValue
                            ? <p
                                className="max-w-[28ch] whitespace-pre-wrap"
                                style={{ textAlign: align }}
                            >
                                {commentValue}
                            </p>
                            : <p className="text-sm text-muted-foreground">No comment</p>}
                    </StandardNode.Content>
                </StandardNode>
            )
        },
    }),
})

type TextAlign = "left" | "center" | "right"