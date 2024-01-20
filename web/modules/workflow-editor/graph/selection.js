import { produce } from "immer"
import _ from "lodash"
import { useCallback, useMemo } from "react"
import { useReactFlow, useStore } from "reactflow"


export function useSelection() {

    const selectedNodes = useStore(s => s.getNodes().filter(n => n.selected), _.isEqual)
    const selectedEdges = useStore(s => s.edges.filter(e => e.selected), _.isEqual)

    const selected = useMemo(() => [...selectedNodes, ...selectedEdges], [selectedNodes, selectedEdges])

    return {
        selectedNodes,
        selectedEdges,
        selected,
    }
}


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 */
export function selectConnectedEdges(rf, nodes) {
    const nodeIds = nodes.map(n => n.id)
    rf.setEdges(produce(draft => {
        draft.forEach(e => e.selected = nodeIds.includes(e.source) && nodeIds.includes(e.target))
    }))
}


/**
 * @param {import("reactflow").Node[]} nodes
 */
export function useSelectConnectedEdges(nodes) {
    const rf = useReactFlow()
    return useCallback(() => selectConnectedEdges(rf, nodes), [rf, nodes])
}


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 */
export function selectOutgoers(rf, nodes) {

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


/**
 * @param {import("reactflow").Node[]} nodes
 */
export function useSelectOutgoers(nodes) {
    const rf = useReactFlow()
    return useCallback(() => selectOutgoers(rf, nodes), [rf, nodes])
}


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 */
export function selectIncomers(rf, nodes) {

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


/**
 * @param {import("reactflow").Node[]} nodes
 */
export function useSelectIncomers(nodes) {
    const rf = useReactFlow()
    return useCallback(() => selectIncomers(rf, nodes), [rf, nodes])
}
