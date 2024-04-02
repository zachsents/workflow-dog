import { useDebouncedCallback } from "@react-hookz/web"
import { DotPath, stringHash, uniqueId } from "@web/modules/util"
import Color from "color"
import { produce } from "immer"
import _ from "lodash"
import { NodeDefinitions } from "packages/client"
import { useCallback, useEffect, useMemo } from "react"
import type { Edge, ReactFlowInstance, ReactFlowState } from "reactflow"
import { useNodeId, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow"
import { PREFIX } from "shared/prefixes"
import type { Node } from "shared/types"
import colors from "tailwindcss/colors"
import { ActionNode } from "../types"


export type NodeDotPath = DotPath<Node>


/**
 * Hook that provides the type definition of a node.
 */
export function useDefinition(nodeId = useNodeId()) {
    const definitionId: string = useStore(s => s.nodeInternals.get(nodeId!)?.data?.definition)
    return useMemo(() => NodeDefinitions.get(definitionId), [definitionId])
}


/**
 * Sets a property of a node using a path.
 */
export function setNodeProperty(rf: ReactFlowInstance, nodeId: string, path: NodeDotPath, value: any) {
    rf.setNodes(produce(draft => {
        const node = draft.find(n => n.id === nodeId)

        if (node === undefined)
            throw new Error(`Node ${nodeId} not found`)

        _.set(node, path, value)
    }))
}


/**
 * Hook that provides the value of a node property.
 */
export function useNodePropertyValue(nodeId = useNodeId(), path: NodeDotPath) {
    return useStore(s => _.get(s.nodeInternals.get(nodeId!), path))
}


/**
 * Hook that provides a setter for a node property.
 */
export function useSetNodeProperty(nodeId = useNodeId(), path: NodeDotPath, {
    debounce = 0,
}: {
    debounce?: number
} = {}) {
    const rf = useReactFlow()
    return useDebouncedCallback(value => setNodeProperty(rf, nodeId!, path, value), [nodeId, path, rf], debounce)
}


/**
 * Hook that provides the value of a node property and a setter.
 */
export function useNodeProperty(nodeId = useNodeId(), path: NodeDotPath, {
    defaultValue,
    debounce = 0,
}: {
    defaultValue?: any
    debounce?: number
} = {}) {
    const value = useNodePropertyValue(nodeId, path)
    const setValue = useSetNodeProperty(nodeId, path, { debounce })

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [value, setValue, defaultValue])

    return [value, setValue] as const
}


export function createInput(inputDefinitionId: string, extra = {}) {
    return {
        id: uniqueId({ prefix: PREFIX.INPUT }),
        definition: inputDefinitionId,
        // mode: inputDefinition.defaultMode || "handle",
        ...extra,
    }
}

export function createOutput(outputDefinitionId: string, extra = {}) {
    return {
        id: uniqueId({ prefix: PREFIX.OUTPUT }),
        definition: outputDefinitionId,
        ...extra,
    }
}


export function useCreateActionNode() {

    const rf = useReactFlow()
    const domNode = useStore(s => s.domNode)

    const createNode = ({
        definition: definitionId,
        position,
        data = {},
        addToGraph = true,
        connect = [],
        addInputs,
        addOutputs,
    }: {
        definition: string
        position?: { x: number, y: number }
        data?: object
        addToGraph?: boolean
        connect?: Partial<Edge & { sourceHandleType: string, targetHandleType: string }>[]
        addInputs?: { inputDefinitionId: string, extra?: any }[]
        addOutputs?: { outputDefinitionId: string, extra?: any }[]
    }) => {

        if (!position) {
            const domNodeBounds = domNode?.getBoundingClientRect()

            if (!domNodeBounds)
                throw new Error("DOM node bounds not found")

            position = rf.screenToFlowPosition({
                x: domNodeBounds!.x + domNodeBounds!.width / 2,
                y: domNodeBounds!.y + domNodeBounds!.height / 2,
            })
        }

        const definition = NodeDefinitions.get(definitionId)

        if (!definition)
            throw new Error(`Definition ${definitionId} not found`)

        const newNode: ActionNode = {
            id: uniqueId({ prefix: PREFIX.NODE }),
            type: "action",
            position,
            data: _.merge({
                definition: definitionId,
                inputs: Object.entries(definition.inputs)
                    .flatMap(([id, input]: [string, any]) => {
                        if (input.group)
                            return Array(input.groupMin ?? 0)
                                .fill(null)
                                .map(() => createInput(id, {
                                    name: `New ${input.name}`
                                }))

                        return createInput(id)
                    }),
                outputs: Object.entries(definition.outputs)
                    .flatMap(([id, output]: [string, any]) => {
                        if (output.group)
                            return Array(output.groupMin ?? 0)
                                .fill(null)
                                .map(() => createOutput(id, {
                                    name: `New ${output.name}`
                                }))

                        return createOutput(id)
                    }),
            }, data),
        }

        if (addInputs) {
            newNode.data.inputs!.push(
                ...addInputs.map(({ inputDefinitionId, extra }) => createInput(inputDefinitionId, extra))
            )
        }

        if (addOutputs) {
            newNode.data.outputs!.push(
                ...addOutputs.map(({ outputDefinitionId, extra }) => createOutput(outputDefinitionId, extra))
            )
        }

        if (addToGraph)
            rf.addNodes(newNode)

        const newEdges = connect.map(params => ({
            id: uniqueId({ prefix: PREFIX.EDGE }),
            ..._.omit(params, ["sourceHandleType", "targetHandleType"]),
            ..."source" in params && {
                target: newNode.id,
                targetHandle: newNode.data.inputs
                    ?.find(i => i.definition === params.targetHandleType)
                    ?.id,
            },
            ..."target" in params && {
                source: newNode.id,
                sourceHandle: newNode.data.outputs
                    ?.find(o => o.definition === params.sourceHandleType)
                    ?.id,
            },
        }))

        if (newEdges.length > 0)
            rf.addEdges(newEdges as Edge[])

        return newNode
    }

    return useCallback(createNode, [rf, domNode])
}


export function useUpdateInternals(nodeId = useNodeId()) {
    const update = useUpdateNodeInternals()
    return useCallback(() => update(nodeId!), [nodeId, update])
}


export function useUpdateInternalsWhenNecessary(nodeId = useNodeId()) {
    const updateInternals = useUpdateInternals(nodeId)

    const handlesHash = useStore(s => {
        const node = s.nodeInternals.get(nodeId!)

        return node ? stringHash([
            node.data.inputs?.map((input: any) => _.pick(input, ["id", "hidden", "mode"])),
            node.data.outputs?.map((output: any) => _.pick(output, ["id", "hidden"])),
            node.data.modifier?.id,
        ]) : null
    })

    useEffect(() => {
        updateInternals()
    }, [handlesHash])

    const selected = useStore(s => s.nodeInternals.get(nodeId!)?.selected)

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateInternals()
        }, 75)

        const cleanup = () => clearInterval(intervalId)
        setTimeout(cleanup, 400)
        return cleanup
    }, [selected])
}



export function useDisabled(nodeId = useNodeId()) {
    const [disabled, setDisabled] = useNodeProperty(nodeId, "data.disabled", {
        defaultValue: false,
    }) as [boolean, (disabled: boolean) => void]

    const findUpstreamDisabled = (state: ReactFlowState, nodeId: string): boolean => {
        const incomingNodeIds = state.edges
            .filter(e => e.target === nodeId)
            .map(e => e.source)

        const upstreamDisabled = incomingNodeIds.some(id => state.nodeInternals.get(id)?.data?.disabled)
        if (upstreamDisabled)
            return true

        return incomingNodeIds.some(id => findUpstreamDisabled(state, id))
    }

    const isUpstreamDisabled = useStore(s => findUpstreamDisabled(s, nodeId!))

    const message = disabled ?
        "This node is disabled." :
        isUpstreamDisabled ?
            "This node is disabled because one of its upstream nodes is disabled." :
            null

    return [disabled, isUpstreamDisabled, setDisabled, message] as const
}


type NodeColorMode = "json" | "css"


export function useNodeColors(nodeId = useNodeId(), mode: NodeColorMode = "json") {
    const definition = useDefinition(nodeId)
    return useNodeDefinitionColors(definition?.id!, mode)
}



export function useNodeDefinitionColors(definitionId: string, mode: NodeColorMode = "json") {
    return useMemo(() => {
        const definition = NodeDefinitions.get(definitionId)
        const baseColor = definition?.color || colors.slate[500]

        const darkColor = Color(baseColor)
            .lightness(20)
            .hex()

        const lightColor = Color(baseColor)
            .lightness(90)
            .hex()

        switch (mode) {
            case "css": return {
                "--base-color": baseColor,
                "--dark-color": darkColor,
                "--light-color": lightColor,
            }
            case "json": return {
                baseColor,
                darkColor,
                lightColor,
            }
        }
    }, [definitionId, mode])
}


export function useIsHandleConnected(nodeId = useNodeId(), handleId: string) {
    return useStore(s => s.edges.some(
        edge => edge.source === nodeId && edge.sourceHandle === handleId
            || edge.target === nodeId && edge.targetHandle === handleId
    ))
}


export function useIsNodeSelected(nodeId = useNodeId()) {
    return useStore(s => s.nodeInternals.get(nodeId!)?.selected) ?? false
}