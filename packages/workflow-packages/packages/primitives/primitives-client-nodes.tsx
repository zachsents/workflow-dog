import { IconHash, IconTextSize, IconToggleLeftFilled } from "@tabler/icons-react"
import { useMemo } from "react"
import { StandardNode } from "web/src/components/action-node"
import { Input } from "web/src/components/ui/input"
import { Switch } from "web/src/components/ui/switch"
import { Textarea } from "web/src/components/ui/textarea"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder"
import { useResizeObserver } from "web/src/lib/hooks"
import { useValueType } from "workflow-types/react"
import { clientNodeHelper, prefixDefinitionIds } from "../../helpers/react"


const createDef = clientNodeHelper({})

export default prefixDefinitionIds("primitives", {
    text: createDef({
        name: "Text",
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

            const resizeRef = useResizeObserver(entry => {
                try {
                    gbx.mutateNodeState(nodeId, n => {
                        n.config._textareaWidth = Math.round(entry.contentRect.width)
                        n.config._textareaHeight = Math.round(entry.contentRect.height)
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
                            className="resize"
                            style={textareaSize}
                            ref={resizeRef}
                        />
                    </StandardNode.Content>
                </StandardNode>
            )
        },
    }),
    number: createDef({
        name: "Number",
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
    }),
    boolean: createDef({
        name: "Switch",
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
    }),
})