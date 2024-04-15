import Loader from "@web/components/loader"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import { useMemo } from "react"
import { Controls, Edge, Node, Panel, ReactFlow } from "reactflow"
import ActionNode from "../action-node/action-node"
import DataEdge from "../data-edge"
import RunControls from "./run-controls"
import RunViewerToolbar from "./run-viewer-toolbar"


export default function CurrentRunGraph() {

    const { data: run, isLoading } = useSelectedWorkflowRun()

    const runState = run?.state as any
    const hasGraph = !!runState?.graph

    return (
        <div className="w-full h-full bg-slate-50">
            {hasGraph ?
                <GraphRenderer
                    nodes={runState?.graph?.nodes || []}
                    edges={runState?.graph?.edges || []}
                /> :
                <div className="w-full h-full relative flex center">
                    {isLoading ?
                        <Loader /> :
                        <p className="text-muted-foreground">
                            Nothing here 🫢
                        </p>}

                    <Panel position="bottom-center" className="!pointer-events-none">
                        <RunViewerToolbar />
                    </Panel>

                    <Panel position="top-right" className="!m-2 !pointer-events-none">
                        <RunControls />
                    </Panel>
                </div>}
        </div>
    )
}

interface GraphRendererProps {
    nodes: Node[]
    edges: Edge[]
}

function GraphRenderer({ nodes, edges }: GraphRendererProps) {

    const convertedNodes = useMemo(() => nodes.map(node => ({
        ...node,
        draggable: false,
        selectable: false,
        focusable: false,
        connectable: false,
        deletable: false,
    })), [])

    const convertedEdges = useMemo(() => edges.map(edge => ({
        ...edge,
        updatable: false,
        selectable: false,
        focusable: false,
        deletable: false,
    })), [])

    return (
        <ReactFlow
            minZoom={0.1}

            defaultNodes={convertedNodes}
            defaultEdges={convertedEdges}

            nodesDraggable={false}
            edgesUpdatable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}

            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}

            connectOnClick={false}

            // This switches whether onMouseDown or onClick is used
            selectNodesOnDrag={false}
            zoomActivationKeyCode={"Control"}

            className="w-full h-full bg-slate-50"
            fitView
            fitViewOptions={fitViewOptions}
        >
            <Controls showInteractive={false} />

            <Panel position="bottom-center" className="!pointer-events-none">
                <RunViewerToolbar />
            </Panel>

            <Panel position="top-right" className="!m-2 !pointer-events-none">
                <RunControls />
            </Panel>
        </ReactFlow>
    )
}


const nodeTypes = {
    action: ActionNode,
}

const edgeTypes = {
    data: DataEdge,
}

const fitViewOptions = {
    padding: 0.75,
}