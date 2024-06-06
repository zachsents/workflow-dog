import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@ui/tooltip"
import Kbd from "@web/components/kbd"
import { Button, ButtonProps } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { Separator } from "@web/components/ui/separator"
import { cn } from "@web/lib/utils"
import { duplicateElements } from "@web/modules/workflow-editor/graph/duplicate"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { getSelectedEdges, getSelectedNodes, selectConnectedEdges, selectIncomers, selectOutgoers, useSelectedEdges, useSelectedNodes } from "@web/modules/workflow-editor/graph/selection"
import { list as modList } from "@web/modules/workflow-editor/modifiers"
import { useEditorStore } from "@web/modules/workflow-editor/store"
import classNames from "classnames"
import { produce } from "immer"
import _ from "lodash"
import React, { useMemo } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { TbArrowLeftSquare, TbArrowRightSquare, TbChartDots3, TbClipboard, TbConfetti, TbConfettiOff, TbCopy, TbTrash } from "react-icons/tb"
import { XYPosition, getNodesBounds, useReactFlow, useStore, useViewport } from "reactflow"


export default function NodeToolbar() {

    const rf = useReactFlow()

    const domNodeBounds: XYPosition = useStore(
        s => s.domNode?.getBoundingClientRect().toJSON()
            ?? { x: 0, y: 0 },
        _.isEqual
    )
    const viewport = useViewport()

    const selectedNodes = useSelectedNodes()
    const selectedEdges = useSelectedEdges()

    const selectionRect = useMemo(() => {
        const rect = getNodesBounds(selectedNodes)
        const screen = rf.flowToScreenPosition({ x: rect.x, y: rect.y })

        return {
            x: screen.x - domNodeBounds.x,
            y: screen.y - domNodeBounds.y,
            width: rect.width * viewport.zoom,
            height: rect.height * viewport.zoom,
        }
    }, [selectedNodes, domNodeBounds, viewport])

    const anyNodes = selectedNodes.length > 0
    const multiple = (selectedNodes.length + selectedEdges.length) > 1
    const isSingleNode = selectedNodes.length == 1

    const hasIncomersToSelect = useStore(
        s => s.edges.some(
            e => !s.nodeInternals.get(e.source)?.selected &&
                s.nodeInternals.get(e.target)?.selected
        )
    )

    const hasOutgoersToSelect = useStore(
        s => s.edges.some(
            e => s.nodeInternals.get(e.source)?.selected &&
                !s.nodeInternals.get(e.target)?.selected
        )
    )

    const hasConnectionsToSelect = useStore(
        s => s.edges.some(
            e => s.nodeInternals.get(e.source)?.selected &&
                s.nodeInternals.get(e.target)?.selected &&
                !e.selected
        )
    )

    return anyNodes && (
        <div
            className={classNames("absolute z-[4] pointer-events-none", {
                "outline-dashed outline-gray outline-1 outline-offset-8 rounded-md": multiple,
            })}
            style={{
                top: `${selectionRect.y}px`,
                left: `${selectionRect.x}px`,
                width: `${selectionRect.width}px`,
                height: `${selectionRect.height}px`,
            }}
        >
            <Card
                className="pointer-events-auto flex items-center flex-nowrap p-1 mb-4 absolute bottom-full left-1/2 -translate-x-1/2"
            >
                {hasIncomersToSelect &&
                    <SelectIncomersControl />}
                {hasOutgoersToSelect &&
                    <SelectOutgoersControl />}
                {hasConnectionsToSelect &&
                    <SelectConnectionsControl />}

                <ToolbarSeparator />

                <EnableControl />

                <ToolbarSeparator />

                <CopyControl />
                <DuplicateControl />
                <DeleteControl />

                <ToolbarSeparator />

                {isSingleNode && modList.map(modType =>
                    <ModifierButton
                        id={modType.id}
                        name={modType.interfaceDefinition.name}
                        icon={modType.icon}
                        key={modType.id}
                    />
                )}
            </Card>
        </div>
    )
}


function SelectIncomersControl() {
    const rf = useReactFlow()
    const action = () => selectIncomers(rf, getSelectedNodes(rf))

    useHotkeys("mod+shift+ArrowLeft", action, {
        preventDefault: true,
    }, [rf])

    return (
        <ToolbarButton
            label="Select Incoming Nodes"
            shortcut={["\u2318", "\u21e7", "\u2190"]}
            icon={TbArrowLeftSquare}
            onClick={action}
        />
    )
}


function SelectOutgoersControl() {
    const rf = useReactFlow()
    const action = () => selectOutgoers(rf, getSelectedNodes(rf))

    useHotkeys("mod+shift+ArrowRight", action, {
        preventDefault: true,
    }, [rf])

    return (
        <ToolbarButton
            label="Select Outgoing Nodes"
            shortcut={["\u2318", "\u21e7", "\u2192"]}
            icon={TbArrowRightSquare}
            onClick={action}
        />
    )
}


function SelectConnectionsControl() {
    const rf = useReactFlow()
    const action = () => selectConnectedEdges(rf, getSelectedNodes(rf))

    useHotkeys("mod+shift+enter", action, {
        preventDefault: true,
    }, [rf])

    return (
        <ToolbarButton
            label="Select Connections"
            shortcut={["\u2318", "\u21e7", "\u23Ce"]}
            icon={TbChartDots3}
            onClick={action}
        />
    )
}


function EnableControl() {

    const areSomeDisabled = useStore(s => s.getNodes().some(n => n.selected && n.data.disabled))

    const rf = useReactFlow()
    const action = () => rf.setNodes(produce(draft => {
        draft.filter(n => n.selected).forEach(n => n.data.disabled = !areSomeDisabled)
    }))

    useHotkeys("mod+shift+e", action, {
        preventDefault: true,
    }, [rf, areSomeDisabled])

    return (
        <ToolbarButton
            label={areSomeDisabled ? "Enable" : "Disable"}
            shortcut={["\u2318", "\u21e7", "E"]}
            icon={areSomeDisabled ? TbConfetti : TbConfettiOff}
            onClick={action}
        />
    )
}


function CopyControl() {
    const copy = useEditorStore(s => s.copy)

    return (
        <ToolbarButton
            label="Copy"
            shortcut={["\u2318", "C"]}
            icon={TbClipboard}
            onClick={copy}
        />
    )
}


function DuplicateControl() {
    const rf = useReactFlow()
    const action = () => duplicateElements(rf, getSelectedNodes(rf), getSelectedEdges(rf))

    useHotkeys("mod+d", action, {
        preventDefault: true,
    }, [rf])

    return (
        <ToolbarButton
            label="Duplicate"
            shortcut={["\u2318", "D"]}
            icon={TbCopy}
            onClick={action}
        />
    )
}


function DeleteControl() {
    const rf = useReactFlow()
    const action = () => rf.deleteElements({ nodes: getSelectedNodes(rf), edges: getSelectedEdges(rf) })

    return (
        <ToolbarButton
            label="Delete"
            shortcut={["Del"]}
            icon={TbTrash}
            onClick={action}
        />
    )
}


function ModifierButton({ id, icon: Icon, name }) {

    const selectedNodeId = useStore(s => s.getNodes().find(n => n.selected)?.id)
    const [enabled, setEnabled] = useNodeProperty(selectedNodeId, `data.controlModifiers.${id}`, {
        defaultValue: false,
    })

    const IconComponent = (props: React.HTMLProps<HTMLDivElement>) =>
        <div
            {...props}
            className={cn(
                props.className,
                "p-1 -m-1 rounded-md",
                enabled && "bg-primary text-primary-foreground",
            )}
        >
            <Icon />
        </div>

    return (
        <ToolbarButton
            label={`${enabled ? "Remove" : "Add"} modifier: ${name}`}
            icon={IconComponent}
            onClick={() => setEnabled(!enabled)}
            variant="ghost"
        />
    )
}


interface ToolbarButtonProps extends ButtonProps {
    label: string
    shortcut?: string | string[]
    icon: JSX.ElementType
}

function ToolbarButton({ label, shortcut, icon: Icon, ...props }: ToolbarButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost" size="icon"
                        {...props}
                    >
                        <Icon className="text-[1.25em]" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex center gap-2">
                        <span>{label}</span>
                        {shortcut &&
                            <Kbd>{shortcut}</Kbd>}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


function ToolbarSeparator() {
    return <Separator orientation="vertical" className="h-[30px] mx-2 first:hidden last:hidden" />
}