import { useClipboard } from "@mantine/hooks"
import { produce } from "immer"
import { useCallback } from "react"
import { getRectOfNodes, useReactFlow } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { uniqueId } from "../util"
import { projectViewportCenterToRF } from "./projection"


const GRAPH_MIME_TYPE = "application/vnd.minus.graph+json"


/**
 * @typedef {object} DuplicateElementsOptions
 * @property {number} xOffset Overrides the default offset
 * @property {number} yOffset Overrides the default offset
 * @property {number} offset Offset used on both axes if xOffset and yOffset are not specified
 * @property {object} position Overrides offset
 * @property {boolean} deselect Deselects the original elements
 */


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 * @param {DuplicateElementsOptions} options
 */
function duplicateElements(rf, nodes, edges, {
    xOffset,
    yOffset,
    offset = 50,
    position,
    deselect = true,
} = {}) {

    const rect = getRectOfNodes(nodes)
    const positionOffsetX = position ? position.x - rect.x : 0
    const positionOffsetY = position ? position.y - rect.y : 0

    const nodeIdMap = {}
    const newNodes = nodes?.map(n => {
        const newNode = structuredClone(n)
        newNode.id = uniqueId(PREFIX.NODE)
        newNode.position.x += position ? positionOffsetX : (xOffset ?? offset)
        newNode.position.y += position ? positionOffsetY : (yOffset ?? offset)
        nodeIdMap[n.id] = newNode.id
        return newNode
    }) ?? []

    const newEdges = edges?.map(e => {
        const newEdge = structuredClone(e)
        newEdge.id = uniqueId(PREFIX.EDGE)
        newEdge.source = nodeIdMap[e.source]
        newEdge.target = nodeIdMap[e.target]

        if (!newEdge.source || !newEdge.target)
            return

        return newEdge
    }).filter(Boolean) ?? []

    const newNodeIds = newNodes.map(n => n.id)
    const newEdgeIds = newEdges.map(e => e.id)

    rf.setNodes(produce(draft => {
        newNodes.forEach(n => draft.push(n))

        if (deselect)
            draft.forEach(n => n.selected = newNodeIds.includes(n.id))
    }))

    rf.setEdges(produce(draft => {
        newEdges.forEach(e => draft.push(e))

        if (deselect)
            draft.forEach(e => e.selected = newEdgeIds.includes(e.id))
    }))
}


/**
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 * @param {DuplicateElementsOptions} options
 */
export function useDuplicateElements(nodes, edges, options) {
    const rf = useReactFlow()

    return useCallback(() => duplicateElements(rf, nodes, edges, options), [rf, nodes, edges])
}


/**
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 */
export function useCopyElementsToClipboard(nodes, edges) {
    const rf = useReactFlow()

    const { copy } = useClipboard()

    return useCallback(() => {
        const nodeIds = nodes.map(n => n.id)
        const edgesToCopy = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target))

        copy(GRAPH_MIME_TYPE + JSON.stringify({
            nodes,
            edges: edgesToCopy,
        }))
    }, [rf, nodes, edges])
}


export function usePasteElementsFromClipboard() {

    const rf = useReactFlow()

    return useCallback(ev => {
        const textContent = ev.clipboardData.getData("text/plain")

        if (!textContent.startsWith(GRAPH_MIME_TYPE))
            return

        const { nodes, edges } = JSON.parse(textContent.replace(GRAPH_MIME_TYPE, ""))

        const center = projectViewportCenterToRF(rf)
        const rect = getRectOfNodes(nodes)

        duplicateElements(rf, nodes, edges, {
            position: {
                x: center.x - rect.width / 2,
                y: center.y - rect.height / 2,
            },
        })
    }, [])
}