import { produce } from "immer"
import _ from "lodash"
import { type ReactFlowInstance, useStore, Node, Edge } from "reactflow"



export function getSelectedNodes(rf: ReactFlowInstance) {
    return rf.getNodes().filter(n => n.selected)
}


export function getSelectedEdges(rf: ReactFlowInstance) {
    return rf.getEdges().filter(n => n.selected)
}


export function useSelectedNodes() {
    return useStore<Node[]>(s => s.getNodes().filter(n => n.selected), _.isEqual)
}


export function useSelectedEdges() {
    return useStore<Edge[]>(s => s.edges.filter(e => e.selected), _.isEqual)
}


export function selectConnectedEdges(rf: ReactFlowInstance, nodes: Node[]) {
    const nodeIds = nodes.map(n => n.id)
    rf.setEdges(produce(draft => {
        draft.forEach(e => e.selected = nodeIds.includes(e.source) && nodeIds.includes(e.target))
    }))
}


export function selectOutgoers(rf: ReactFlowInstance, nodes: Node[]) {
    const nodeIds = nodes.map(n => n.id)
    const outgoingEdges = rf.getEdges().filter(e => nodeIds.includes(e.source))
    const outgoingEdgeIds = outgoingEdges.map(e => e.id)
    const targetIds = outgoingEdges.map(e => e.target)

    rf.setNodes(produce(draft => {
        draft.filter(n => targetIds.includes(n.id)).forEach(n => n.selected = true)
    }))

    rf.setEdges(produce(draft => {
        draft.filter(e => outgoingEdgeIds.includes(e.id)).forEach(e => e.selected = true)
    }))
}


export function selectIncomers(rf: ReactFlowInstance, nodes: Node[]) {
    const nodeIds = nodes.map(n => n.id)
    const incomingEdges = rf.getEdges().filter(e => nodeIds.includes(e.target))
    const incomingEdgeIds = incomingEdges.map(e => e.id)
    const sourceIds = incomingEdges.map(e => e.source)

    rf.setNodes(produce(draft => {
        draft.filter(n => sourceIds.includes(n.id)).forEach(n => n.selected = true)
    }))

    rf.setEdges(produce(draft => {
        draft.filter(e => incomingEdgeIds.includes(e.id)).forEach(e => e.selected = true)
    }))
}