import { useDebouncedCallback } from "@react-hookz/web"
import { DotPath, stringHash, uniqueId } from "@web/modules/util"
import Color from "color"
import _ from "lodash"
import { NodeDefinitions } from "packages/client"
import { useCallback, useEffect, useMemo } from "react"
import type { Edge, Node as RFNode, ReactFlowInstance, ReactFlowState } from "reactflow"
import { internalsSymbol, useNodeId, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow"
import { PREFIX } from "shared/prefixes"
import type { Node } from "shared/types"
import colors from "tailwindcss/colors"
import { ActionNode } from "../types"


export type NodeDotPath = DotPath<Node>


/**
 * Hook that provides the type definition of a node.
 */
export function useDefinition(nodeId = useNodeId()) {
    const definitionId = useStore<string>(
        s => s.nodeInternals.get(nodeId!)?.data?.definition
    )
    return useMemo(() => NodeDefinitions.get(definitionId), [definitionId])
}


/**
 * Sets a property of a node using a path.
 */
export function setNodeProperty<T>(rf: ReactFlowInstance, nodeId: string, path: NodeDotPath, value: T) {
    rf.setNodes(nodes => nodes.map(n => {
        if (n.id === nodeId) {
            _.set(n, path, value)

            /**
             * This part is critical.
             * @see https://reactflow.dev/examples/nodes/update-node
             */
            if (path.startsWith("data"))
                n.data = structuredClone(n.data)
        }
        return n
    }))
}


/**
 * Hook that provides the value of a node property.
 */
export function useNodePropertyValue<T>(nodeId = useNodeId(), path: NodeDotPath) {
    return useStore<T>(s => _.get(s.nodeInternals.get(nodeId!), path))
}


interface UseNodePropertyOptions<T> {
    defaultValue?: T | undefined
    debounce?: number | false
}

/**
 * Hook that provides the value of a node property and a setter.
 */
export function useNodeProperty<T>(nodeId = useNodeId()!, path: NodeDotPath, {
    defaultValue,
    debounce,
}: UseNodePropertyOptions<T> = {}) {

    const rf = useReactFlow()
    const value = useNodePropertyValue<T>(nodeId, path)

    const callbackOptions = [
        (newValue: T) => setNodeProperty(rf, nodeId, path, newValue),
        [rf, nodeId, path],
    ] as const

    const setValue = typeof debounce === "number"
        ? useDebouncedCallback(...callbackOptions, debounce)
        : useCallback(...callbackOptions)

    const shouldUseDefault = defaultValue !== undefined && value === undefined

    useEffect(() => {
        if (shouldUseDefault)
            setValue(defaultValue)
    }, [shouldUseDefault, defaultValue])

    return [
        shouldUseDefault ? defaultValue : value,
        setValue,
    ] as const
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
        const node = s.nodeInternals.get(nodeId!) as ActionNode
        return node ? stringHash([
            _.map(node.data.inputs, "id"),
            _.map(node.data.outputs, "id"),
            Object.keys(node.data.controlModifiers ?? {})
                .filter(k => node.data.controlModifiers?.[k]),
        ]) : null
    })

    useEffect(() => {
        console.debug("Updating internals for", nodeId)
        updateInternals()
    }, [handlesHash])

    /**
     * For animated selection state
     */
    // const selected = useStore(s => s.nodeInternals.get(nodeId!)?.selected)

    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         updateInternals()
    //     }, 75)

    //     const cleanup = () => clearInterval(intervalId)
    //     setTimeout(cleanup, 400)
    //     return cleanup
    // }, [selected])
}



export function useDisabled(nodeId = useNodeId()!) {
    const [disabled, setDisabled] = useNodeProperty(nodeId, "data.disabled", {
        defaultValue: false,
    })

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

export function useIsHandleConnectedEdgeSelected(nodeId = useNodeId(), handleId: string) {
    return useStore(s => s.edges.some(
        edge => edge.selected && (
            edge.source === nodeId && edge.sourceHandle === handleId
            || edge.target === nodeId && edge.targetHandle === handleId
        )
    ))
}

export function useIsHandleConnectable(nodeId = useNodeId(), handleId: string) {
    const isConnected = useIsHandleConnected(undefined, handleId)
    const isOutput = useStore(s => !!s.nodeInternals.get(nodeId!)?.[internalsSymbol]?.handleBounds?.source
        ?.find(h => h.id === handleId))
    return !isConnected || isOutput
}

export function useIsHandleConnectableWhileConnecting(nodeId = useNodeId(), handleId: string) {
    const isConnectable = useIsHandleConnectable(nodeId, handleId)
    const startHandle = useStore(s => s.connectionStartHandle)
    const hasEndHandle = useStore(s => !!s.connectionEndHandle)
    const type = useStore(s => !!s.nodeInternals.get(nodeId!)?.[internalsSymbol]?.handleBounds?.source
        ?.find(h => h.id === handleId) ? "source" : "target")
    return !!startHandle
        && isConnectable
        && startHandle.handleId !== handleId
        && nodeId !== startHandle.nodeId
        && type !== startHandle.type
        && !hasEndHandle
}

export function useHandleRect(nodeId = useNodeId(), handleId: string) {

    const getNode = (s: ReactFlowState) => s.nodeInternals.get(nodeId!)

    const findHandle = (node: RFNode) => Object.values(node?.[internalsSymbol]?.handleBounds ?? {})
        .flat()
        .find(h => h?.id === handleId)

    const selectHandlePosition = (s: ReactFlowState, coord: "x" | "y") => {
        const node = getNode(s)
        const nodeCoord = node?.positionAbsolute?.[coord] ?? 0
        const handleCoord = findHandle(node!)?.[coord] ?? 0
        return nodeCoord + handleCoord
    }
    const x = useStore(s => selectHandlePosition(s, "x"))
    const y = useStore(s => selectHandlePosition(s, "y"))
    const width = useStore(s => findHandle(getNode(s)!)?.width ?? 0)
    const height = useStore(s => findHandle(getNode(s)!)?.height ?? 0)

    return { x, y, width, height }
}

export function useIsNodeSelected(nodeId = useNodeId()) {
    return useStore(s => s.nodeInternals.get(nodeId!)?.selected) ?? false
}