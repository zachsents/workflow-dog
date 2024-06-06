import { produce } from "immer"
import type { Edge, Node, ReactFlowInstance, XYPosition } from "reactflow"
import { getNodesBounds } from "reactflow"
import { IdNamespace, createRandomId } from "shared/utils"
import { ActionNodeInput, ActionNodeOutput } from "../types"


interface DuplicateElementsOptions {
    /** Overrides the default offset */
    xOffset?: number
    /** Overrides the default offset */
    yOffset?: number
    /** Offset used on both axes if xOffset and yOffset are not specified */
    offset?: number
    /** Overrides offset */
    position?: XYPosition
}

export function duplicateElements(
    rf: ReactFlowInstance,
    nodes?: Node[],
    edges?: Edge[],
    {
        xOffset,
        yOffset,
        offset = 50,
        position,
    }: DuplicateElementsOptions = {}
) {

    const rect = getNodesBounds(nodes ?? [])
    const positionOffsetX = position ? position.x - rect.x : 0
    const positionOffsetY = position ? position.y - rect.y : 0

    const nodeIdMap: Record<string, string> = {}
    const nodeInputIdMap: Record<string, string> = {}
    const nodeOutputIdMap: Record<string, string> = {}

    const newNodes = nodes?.map(n => {
        const newNode = structuredClone(n)
        newNode.id = createRandomId(IdNamespace.ActionNode)
        newNode.position.x += position ? positionOffsetX : (xOffset ?? offset)
        newNode.position.y += position ? positionOffsetY : (yOffset ?? offset)
        newNode.selected = true

        newNode.data.inputs?.forEach((input: ActionNodeInput) => {
            const newInputId = createRandomId(IdNamespace.InputHandle)
            nodeInputIdMap[input.id] = newInputId
            input.id = newInputId
        })

        newNode.data.outputs?.forEach((output: ActionNodeOutput) => {
            const newOutputId = createRandomId(IdNamespace.OutputHandle)
            nodeOutputIdMap[output.id] = newOutputId
            output.id = newOutputId
        })

        nodeIdMap[n.id] = newNode.id

        return newNode
    }) ?? []

    const newEdges = (edges?.map(e => {
        const newEdge = structuredClone(e)
        newEdge.id = createRandomId(IdNamespace.Edge)
        newEdge.source = nodeIdMap[e.source]
        newEdge.sourceHandle = nodeOutputIdMap[e.sourceHandle!] || e.sourceHandle
        newEdge.target = nodeIdMap[e.target]
        newEdge.targetHandle = nodeInputIdMap[e.targetHandle!] || e.targetHandle
        newEdge.selected = true

        if (!newEdge.source || !newEdge.target)
            return

        return newEdge
    }).filter(Boolean) ?? []) as Edge[]

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
