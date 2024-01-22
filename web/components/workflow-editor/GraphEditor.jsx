import { Kbd, Tooltip } from "@nextui-org/react"
import { useGraphSaving } from "@web/modules/workflow-editor/graph"
import { useGraphCopyPaste } from "@web/modules/workflow-editor/graph/use-copy-paste"
import { useGraphContextMenu } from "@web/modules/workflow-editor/graph/use-graph-context-menu"
import { useGraphUndoRedo } from "@web/modules/workflow-editor/graph/use-graph-undo-redo"
import { useOnConnect } from "@web/modules/workflow-editor/graph/use-on-connect"
import { useSelectAll } from "@web/modules/workflow-editor/graph/use-select-all"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { TbArrowBack, TbArrowForward } from "react-icons/tb"
import { Background, ControlButton, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useStore } from "reactflow"
import "reactflow/dist/style.css"
import colors from "tailwindcss/colors"
import Group from "../layout/Group"
import ContextMenu from "./ContextMenu"
import DataEdge from "./DataEdge"
import GhostBuster from "./GhostBuster"
import NodeToolbar from "./NodeToolbar"
import ActionNode from "./action-node/ActionNode"


export default function GraphEditor({ initialGraph: { nodes: initialNodes = [], edges: initialEdges = [] } = {} }) {

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, , onEdgesChange] = useEdgesState(initialEdges)
    const onConnect = useOnConnect()

    const [settings] = useEditorSettings()
    const onContextMenu = useGraphContextMenu()

    const [onCopy, onPaste] = useGraphCopyPaste()

    // useGraphSaving(nodes, edges, setNodes, setEdges)

    return (
        <>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}

                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}

                connectOnClick={false}
                snapGrid={snapGrid}
                snapToGrid={settings.showGrid || false}

                elevateNodesOnSelect
                elevateEdgesOnSelect
                nodesFocusable={false}
                edgesFocusable={false}
                // This switches whether onMouseDown or onClick is used
                selectNodesOnDrag={false}
                selectionKeyCode={"Control"}
                multiSelectionKeyCode={"Shift"}
                zoomActivationKeyCode={null}
                deleteKeyCode={graphDeleteKeys}

                className="flex-1"

                onCopy={onCopy}
                onPaste={() => onPaste()}
                onPaneContextMenu={onContextMenu}
                fitView
            >
                {settings.showMinimap &&
                    <MiniMap pannable zoomable />}

                {settings.showGrid &&
                    <Background variant="lines" gap={snapGrid[0]} offset={0.4} color={colors.gray[100]} />}

                <Controls showInteractive={false}>
                    <AdditionalControls />
                </Controls>

                <NodeToolbar />
                <ContextMenu />
            </ReactFlow>
            <GhostBuster />
            <GraphHooks />
        </>
    )
}

const nodeTypes = {
    action: ActionNode,
}

const edgeTypes = {
    data: DataEdge,
}

const defaultEdgeOptions = {
    type: "data",
}

const snapGrid = [25, 25]

const graphDeleteKeys = ["Delete", "Backspace"]


function GraphHooks() {
    useGraphUndoRedo()
    useSelectAll()
    useGraphSaving()
}


function AdditionalControls() {

    const undo = useStore(s => s.undo)
    const redo = useStore(s => s.redo)

    return (<>
        <AdditionalControlButton
            label="Undo"
            shortcutKey="Z"
            onClick={undo}
            icon={TbArrowBack}
        />
        <AdditionalControlButton
            label="Redo"
            shortcutKey="Y"
            onClick={redo}
            icon={TbArrowForward}
        />
    </>)
}

function AdditionalControlButton({ label, shortcutKey, onClick, icon: Icon }) {

    return (
        <Tooltip
            content={<Group className="gap-unit-sm">
                <span>{label}</span>
                <Kbd keys={["command"]}>{shortcutKey}</Kbd>
            </Group>}
            placement="right"
            isDisabled={!label}
        >
            <div>
                <ControlButton onClick={onClick}>
                    <Icon />
                </ControlButton>
            </div>
        </Tooltip>
    )
}

