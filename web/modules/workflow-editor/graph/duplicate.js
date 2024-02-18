import { produce } from "immer"
import { getNodesBounds } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { uniqueId } from "../util"




/**
 * @typedef {object} DuplicateElementsOptions
 * @property {number} xOffset Overrides the default offset
 * @property {number} yOffset Overrides the default offset
 * @property {number} offset Offset used on both axes if xOffset and yOffset are not specified
 * @property {object} position Overrides offset
 */


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 * @param {DuplicateElementsOptions} options
 */
export function duplicateElements(rf, nodes, edges, {
    xOffset,
    yOffset,
    offset = 50,
    position,
} = {}) {

    const rect = getNodesBounds(nodes)
    const positionOffsetX = position ? position.x - rect.x : 0
    const positionOffsetY = position ? position.y - rect.y : 0

    const nodeIdMap = {}
    const nodeInputIdMap = {}
    const nodeOutputIdMap = {}
    const newNodes = nodes?.map(n => {
        const newNode = structuredClone(n)
        newNode.id = uniqueId(PREFIX.NODE)
        newNode.position.x += position ? positionOffsetX : (xOffset ?? offset)
        newNode.position.y += position ? positionOffsetY : (yOffset ?? offset)
        newNode.selected = true

        newNode.data.inputs?.forEach(input => {
            const newInputId = uniqueId(PREFIX.INPUT)
            nodeInputIdMap[input.id] = newInputId
            input.id = newInputId
        })

        newNode.data.outputs?.forEach(output => {
            const newOutputId = uniqueId(PREFIX.OUTPUT)
            nodeOutputIdMap[output.id] = newOutputId
            output.id = newOutputId
        })

        nodeIdMap[n.id] = newNode.id

        return newNode
    }) ?? []

    const newEdges = edges?.map(e => {
        const newEdge = structuredClone(e)
        newEdge.id = uniqueId(PREFIX.EDGE)
        newEdge.source = nodeIdMap[e.source]
        newEdge.sourceHandle = nodeOutputIdMap[e.sourceHandle] || e.sourceHandle
        newEdge.target = nodeIdMap[e.target]
        newEdge.targetHandle = nodeInputIdMap[e.targetHandle] || e.targetHandle
        newEdge.selected = true

        if (!newEdge.source || !newEdge.target)
            return

        return newEdge
    }).filter(Boolean) ?? []

    rf.setNodes(nodes => [
        ...nodes.map(n => produce(n, draft => {
            draft.selected = false
        })),
        ...newNodes,
    ])

    rf.setEdges(edges => [
        ...edges.map(e => produce(e, draft => {
            draft.selected = false
        })),
        ...newEdges,
    ])
}
