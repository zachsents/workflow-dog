// import { useCopyElementsToClipboard, useDuplicateElements } from "@web/modules/graph/duplicate"
// import { useSelectConnectedEdges, useSelectIncomers, useSelectOutgoers, useSelection } from "@web/modules/graph/selection"
import { Button, Card, Divider, Kbd, Tooltip } from "@nextui-org/react"
import { useHotkey } from "@web/modules/util"
import { duplicateElements } from "@web/modules/workflow-editor/graph/duplicate"
import { getSelectedEdges, getSelectedNodes, selectConnectedEdges, selectIncomers, selectOutgoers, useSelectedEdges, useSelectedNodes } from "@web/modules/workflow-editor/graph/selection"
import classNames from "classnames"
import _ from "lodash"
import { useMemo } from "react"
import { TbArrowLeftSquare, TbArrowRightSquare, TbChartDots3, TbClipboard, TbConfetti, TbConfettiOff, TbCopy, TbTrash } from "react-icons/tb"
import { getRectOfNodes, useReactFlow, useStore, useViewport } from "reactflow"
import Group from "../layout/Group"
import { produce } from "immer"
// import KeyboardShortcut from "./KeyboardShortcut"
// import ToolbarIcon from "./ToolbarIcon"


export default function NodeToolbar() {

    const rf = useReactFlow()

    const domNodeBounds = useStore(s => s.domNode?.getBoundingClientRect().toJSON() ?? { x: 0, y: 0 }, _.isEqual)
    const viewport = useViewport()

    const selectedNodes = useSelectedNodes()
    const selectedEdges = useSelectedEdges()

    const selectionRect = useMemo(() => {
        const rect = getRectOfNodes(selectedNodes)
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

    const hasIncomersToSelect = useStore(
        s => s.edges.some(
            e => !s.nodeInternals.get(e.source).selected &&
                s.nodeInternals.get(e.target).selected
        )
    )

    const hasOutgoersToSelect = useStore(
        s => s.edges.some(
            e => s.nodeInternals.get(e.source).selected &&
                !s.nodeInternals.get(e.target).selected
        )
    )

    const hasConnectionsToSelect = useStore(
        s => s.edges.some(
            e => s.nodeInternals.get(e.source).selected &&
                s.nodeInternals.get(e.target).selected &&
                !e.selected
        )
    )

    return anyNodes && (
        <div
            className={classNames("absolute z-[4] pointer-events-none", {
                "outline-dashed outline-gray outline-1 outline-offset-[1rem] rounded-sm": multiple,
            })}
            style={{
                top: `${selectionRect.y}px`,
                left: `${selectionRect.x}px`,
                width: `${selectionRect.width}px`,
                height: `${selectionRect.height}px`,
            }}
        >
            <Card className="pointer-events-auto flex-nowrap p-1 mb-unit-lg absolute bottom-full left-1/2 -translate-x-1/2">
                <Group>
                    {hasIncomersToSelect &&
                        <SelectIncomersControl />}
                    {hasOutgoersToSelect &&
                        <SelectOutgoersControl />}
                    {hasConnectionsToSelect &&
                        <SelectConnectionsControl />}

                    <Divider orientation="vertical" className="h-[30px] mx-2 first:hidden last:hidden" />

                    <EnableControl />

                    <Divider orientation="vertical" className="h-[30px] mx-2 first:hidden last:hidden" />

                    <CopyControl />
                    <DuplicateControl />
                    <DeleteControl />
                </Group>
            </Card>
        </div>
    )
}


function SelectIncomersControl() {
    const rf = useReactFlow()
    const action = () => selectIncomers(rf, getSelectedNodes(rf))

    useHotkey("mod+shift+ArrowLeft", action, {
        preventDefault: true,
        callbackDependencies: [rf],
    })

    return (
        <ToolbarButton
            label="Select Incomers"
            shortcutModifiers={["command", "shift", "left"]}
            icon={TbArrowLeftSquare}
            onPress={action}
        />
    )
}


function SelectOutgoersControl() {
    const rf = useReactFlow()
    const action = () => selectOutgoers(rf, getSelectedNodes(rf))

    useHotkey("mod+shift+ArrowRight", action, {
        preventDefault: true,
        callbackDependencies: [rf],
    })

    return (
        <ToolbarButton
            label="Select Outgoers"
            shortcutModifiers={["command", "shift", "right"]}
            icon={TbArrowRightSquare}
            onPress={action}
        />
    )
}


function SelectConnectionsControl() {
    const rf = useReactFlow()
    const action = () => selectConnectedEdges(rf, getSelectedNodes(rf))

    useHotkey("mod+shift+Enter", action, {
        preventDefault: true,
        callbackDependencies: [rf],
    })

    return (
        <ToolbarButton
            label="Select Connections"
            shortcutModifiers={["command", "shift", "enter"]}
            icon={TbChartDots3}
            onPress={action}
        />
    )
}


function EnableControl() {

    const areSomeDisabled = useStore(s => s.getNodes().some(n => n.selected && n.data.disabled))

    const rf = useReactFlow()
    const action = () => rf.setNodes(produce(draft => {
        draft.filter(n => n.selected).forEach(n => n.data.disabled = !areSomeDisabled)
    }))

    useHotkey("mod+shift+e", action, {
        preventDefault: true,
        callbackDependencies: [rf, areSomeDisabled],
    })

    return (
        <ToolbarButton
            label={areSomeDisabled ? "Enable" : "Disable"}
            shortcutModifiers={["command", "shift"]}
            shortcutKey="E"
            icon={areSomeDisabled ? TbConfetti : TbConfettiOff}
            onPress={action}
        />
    )
}


function CopyControl() {
    const copy = useStore(s => s.copy)

    return (
        <ToolbarButton
            label="Copy"
            shortcutModifiers={["command"]}
            shortcutKey="C"
            icon={TbClipboard}
            onPress={copy}
        />
    )
}


function DuplicateControl() {
    const rf = useReactFlow()
    const action = () => duplicateElements(rf, getSelectedNodes(rf), getSelectedEdges(rf))

    useHotkey("mod+d", action, {
        preventDefault: true,
        callbackDependencies: [rf],
    })

    return (
        <ToolbarButton
            label="Duplicate"
            shortcutModifiers={["command"]}
            shortcutKey="D"
            icon={TbCopy}
            onPress={action}
        />
    )
}


function DeleteControl() {
    const rf = useReactFlow()
    const action = () => rf.deleteElements({ nodes: getSelectedNodes(rf), edges: getSelectedEdges(rf) })

    return (
        <ToolbarButton
            label="Delete"
            shortcutModifiers={["delete"]}
            icon={TbTrash}
            onPress={action}
        />
    )
}


function ToolbarButton({ label, shortcutKey, shortcutModifiers = ["command"], icon: Icon, onPress }) {

    return (
        <Tooltip closeDelay={0} content={<Group className="gap-unit-sm">
            <span>{label}</span>
            <Kbd keys={shortcutModifiers}>{shortcutKey}</Kbd>
        </Group>}>
            <Button
                isIconOnly variant="light"
                onPress={onPress}
            >
                <Icon className="text-[1.25em]" />
            </Button>
        </Tooltip>
    )
}