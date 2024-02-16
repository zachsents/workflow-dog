import { Spinner } from "@nextui-org/react"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import { Controls, ReactFlow, ReactFlowProvider } from "reactflow"
import DataEdge from "./DataEdge"
import ActionNode from "./action-node/ActionNode"
import { useMemo } from "react"
import Center from "../layout/Center"


export default function RunGraphView() {

    const { data: run, isLoading } = useSelectedWorkflowRun()

    return (
        <div className="w-full h-full bg-gray-50">
            {isLoading ?
                <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> :
                run?.state?.graph ?
                    <ReactFlowProvider key={run?.id}>
                        <GraphRenderer nodes={run?.state?.graph?.nodes} edges={run?.state?.graph?.edges} />
                    </ReactFlowProvider> :
                    <Center className="w-full h-full">
                        <p className="text-default-500">Nothing here 🫢</p>
                    </Center>}
        </div>
    )
}


function GraphRenderer({ nodes, edges }) {

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

            className="w-full h-full bg-gray-50"
            fitView
            fitViewOptions={fitViewOptions}
        >
            <Controls showInteractive={false} />
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