import { useHotkeys } from "react-hotkeys-hook"
import { applyEdgeChanges, applyNodeChanges, useReactFlow } from "reactflow"


export function useSelectAll() {
    const rf = useReactFlow()

    useHotkeys("mod+a", () => {
        const nodes = rf.getNodes()
        const edges = rf.getEdges()
        rf.setNodes(applyNodeChanges(nodes.map(node => ({
            id: node.id,
            type: "select",
            selected: true,
        })), nodes))
        rf.setEdges(applyEdgeChanges(edges.map(edge => ({
            id: edge.id,
            type: "select",
            selected: true,
        })), edges))
    }, {
        preventDefault: true,
    }, [rf])
}