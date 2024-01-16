import { useHotkeys } from "@mantine/hooks"
import { Kbd, Tooltip } from "@nextui-org/react"
import { RF_ELEMENT_ID } from "@web/modules/workflow-editor/graph"
import { usePasteElementsFromClipboard } from "@web/modules/workflow-editor/graph/duplicate"
import { useGraphContextMenu } from "@web/modules/workflow-editor/graph/use-graph-context-menu"
import { useGraphUndoRedo } from "@web/modules/workflow-editor/graph/use-graph-undo-redo"
import { useOnConnect } from "@web/modules/workflow-editor/graph/use-on-connect"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { TbArrowBack, TbArrowForward } from "react-icons/tb"
import { Background, ControlButton, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "reactflow"
import "reactflow/dist/style.css"
import colors from "tailwindcss/colors"
import Group from "../layout/Group"
import ContextMenu from "./ContextMenu"
import ActionNode from "./ActionNode"


/** @type {import("reactflow").Node[]} */
const initialNodes = []
/** @type {import("reactflow").Edge[]} */
const initialEdges = []


export default function GraphEditor() {

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const [settings] = useEditorSettings()
    const onConnect = useOnConnect()
    const [undo, redo] = useGraphUndoRedo(nodes, edges)
    const pasteHandler = usePasteElementsFromClipboard()
    const [onContextMenu] = useGraphContextMenu()

    useHotkeys([
        ["ctrl+a", () => {
            setNodes(nodes => nodes.map(node => ({ ...node, selected: true })))
            setEdges(edges => edges.map(edge => ({ ...edge, selected: true })))
        }],
    ])

    // useGraphSaving(nodes, edges, setNodes, setEdges)

    return (
        <>
            <ReactFlow
                className="flex-1"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                // edgeTypes={edgeTypes}

                // defaultEdgeOptions={defaultEdgeOptions}
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
                id={RF_ELEMENT_ID}

                onPaste={pasteHandler}
                onPaneContextMenu={onContextMenu}
            >
                {settings.showMinimap &&
                    <MiniMap pannable zoomable />}

                {settings.showGrid &&
                    <Background variant="lines" gap={snapGrid[0]} offset={0.4} color={colors.gray[100]} />}

                <Controls showInteractive={false}>
                    <Tooltip
                        content={<Group className="gap-unit-sm">
                            <span>Undo</span>
                            <Kbd keys={["command"]}>Z</Kbd>
                        </Group>}
                        placement="right"
                    >
                        <div>
                            <ControlButton onClick={undo}>
                                <TbArrowBack />
                            </ControlButton>
                        </div>
                    </Tooltip>
                    <Tooltip
                        content={<Group className="gap-unit-sm">
                            <span>Redo</span>
                            <Kbd keys={["command"]}>Y</Kbd>
                        </Group>}
                        placement="right"
                    >
                        <div>
                            <ControlButton onClick={redo}>
                                <TbArrowForward />
                            </ControlButton>
                        </div>
                    </Tooltip>
                </Controls>

                {/* <NodeToolbar /> */}
                <ContextMenu />
            </ReactFlow>
            {/* <GhostBuster /> */}
        </>
    )
}

const nodeTypes = {
    "action": ActionNode,
}

// const edgeTypes = {
//     "data": DataEdge,
// }

const snapGrid = [25, 25]

const graphDeleteKeys = ["Delete", "Backspace"]

// const defaultEdgeOptions = {
//     type: EDGE_TYPE.DATA,
// }