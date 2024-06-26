"use client"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@ui/tooltip"
import Kbd from "@web/components/kbd"
import { cn } from "@web/lib/utils"
import { useGraphSaving } from "@web/modules/workflow-editor/graph"
import { useGraphCopyPaste } from "@web/modules/workflow-editor/graph/use-copy-paste"
import { useGraphContextMenu } from "@web/modules/workflow-editor/graph/use-graph-context-menu"
import { useGraphUndoRedo } from "@web/modules/workflow-editor/graph/use-graph-undo-redo"
import { useOnConnect } from "@web/modules/workflow-editor/graph/use-on-connect"
import { useSelectAll } from "@web/modules/workflow-editor/graph/use-select-all"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { useEditorStore } from "@web/modules/workflow-editor/store"
import React from "react"
import { TbArrowBack, TbArrowForward } from "react-icons/tb"
import ReactFlow, { Background, BackgroundVariant, ControlButton, Controls, Edge, MiniMap, Node, Panel, useEdgesState, useNodesState, type ControlButtonProps } from "reactflow"
import "reactflow/dist/style.css"
import colors from "tailwindcss/colors"
import ActionNode from "./action-node/action-node"
import ConnectionLine from "./connection-line"
import ContextMenu from "./context-menu"
import DataEdge from "./data-edge"
import EditorToolbar from "./editor-toolbar"
import GhostBuster from "./ghost-buster"
import EditWorkflowHeader from "./header"
import NodeToolbar from "./node-toolbar"


const nodeTypes = {
    action: ActionNode,
}

const edgeTypes = {
    data: DataEdge,
}

const defaultEdgeOptions = {
    type: "data",
    // animated: true,
}

const snapGrid: [number, number] = [25, 25]
const graphDeleteKeys = ["Delete", "Backspace"]


interface WorkflowGraphEditorProps extends React.ComponentProps<typeof ReactFlow> {
    initialGraph: { nodes: Node[], edges: Edge[] }
}

export default function WorkflowGraphEditor({
    initialGraph,
    ...props
}: WorkflowGraphEditorProps) {

    const [nodes, , onNodesChange] = useNodesState(initialGraph.nodes)
    const [edges, , onEdgesChange] = useEdgesState(initialGraph.edges)
    const onConnect = useOnConnect()

    const [settings] = useEditorSettings()
    const onContextMenu = useGraphContextMenu()

    const [onCopy, onPaste] = useGraphCopyPaste()

    return (
        <>
            <ReactFlow
                {...props}
                minZoom={0.1}

                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}

                // nodesDraggable

                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}

                connectionLineComponent={ConnectionLine}
                connectOnClick={false}
                snapGrid={snapGrid}
                snapToGrid={settings?.showGrid || false}

                elevateNodesOnSelect={true}
                elevateEdgesOnSelect={false}
                nodesFocusable={false}
                edgesFocusable={false}
                // This switches whether onMouseDown or onClick is used
                selectNodesOnDrag={false}
                selectionKeyCode={"Control"}
                multiSelectionKeyCode={"Shift"}
                zoomActivationKeyCode={"Control"}
                deleteKeyCode={graphDeleteKeys}

                // panOnScroll
                // panOnScrollMode="free"
                // panOnScrollSpeed={1.5}
                // zoomOnPinch
                // zoomOnDoubleClick
                // zoomOnScroll={false}

                id="workflow-graph-editor"
                className={cn(
                    "w-full h-full bg-slate-50",
                    props.className
                )}

                onCopy={onCopy}
                onPaste={() => onPaste()}
                onPaneContextMenu={onContextMenu}
                fitView
            >
                {settings?.showMinimap &&
                    <MiniMap pannable zoomable />}

                {settings?.showGrid &&
                    <>
                        {/* <Background
                            variant={BackgroundVariant.Dots}
                            gap={snapGrid[0]}
                            offset={0.4}
                            size={0.5}
                            color={colors.slate[200]}
                        /> */}
                        <Background
                            variant={BackgroundVariant.Lines}
                            gap={snapGrid[0]}
                            offset={0.4}
                            color={colors.slate[200]}
                        />
                    </>}

                <Controls showInteractive={false}>
                    <AdditionalControls />
                </Controls>

                <NodeToolbar />
                <ContextMenu />

                <Panel position="bottom-center" className="!pointer-events-none">
                    <EditorToolbar />
                </Panel>

                <Panel position="top-center" className="!m-2 !pointer-events-none">
                    <EditWorkflowHeader />
                </Panel>
            </ReactFlow>
            <GhostBuster />
            <GraphHooks />
        </>
    )
}


function GraphHooks() {
    useGraphUndoRedo()
    useSelectAll()
    useGraphSaving()
    return null
}


function AdditionalControls() {

    const undo = useEditorStore(s => s.undo)
    const redo = useEditorStore(s => s.redo)

    return (<>
        <AdditionalControlButton
            label="Undo"
            shortcut={["\u2318", "Z"]}
            icon={TbArrowBack}
            onClick={undo}
        />
        <AdditionalControlButton
            label="Redo"
            shortcut={["\u2318", "Y"]}
            icon={TbArrowForward}
            onClick={redo}
        />
    </>)
}


interface AdditionalControlButtonProps extends ControlButtonProps {
    label: string
    shortcut: string | string[]
    icon: JSX.ElementType
}

function AdditionalControlButton({
    label,
    shortcut,
    icon: Icon,
    ...props
}: AdditionalControlButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <ControlButton {...props}>
                        <Icon />
                    </ControlButton>
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
