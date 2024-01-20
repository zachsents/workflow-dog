import { produce } from "immer"
import _ from "lodash"
import { object as nodeDefs } from "nodes/web"
import { useCallback, useEffect, useMemo } from "react"
import { useNodeId, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { _get, _set, uniqueId } from "../util"
import { useNodeInputs } from "./interfaces"


/**
 * @param {string | import("reactflow").Node} nodeOrNodeId
 * @param {import("reactflow").ReactFlowInstance} rf
 */
export function getDefinition(nodeOrNodeId, rf) {
    if (typeof nodeOrNodeId === "string")
        nodeOrNodeId = rf.getNode(nodeOrNodeId)

    return nodeDefs[nodeOrNodeId?.data?.definition]
}


/**
 * @param {string | import("reactflow").Node} [nodeOrNodeId]
 */
export function useDefinition(nodeOrNodeId) {
    const rf = useReactFlow()

    if (nodeOrNodeId === undefined)
        nodeOrNodeId = useNodeId()

    return useMemo(() => getDefinition(nodeOrNodeId, rf), [nodeOrNodeId, rf])
}


/**
 * Sets a property of a node using a path.
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {string} nodeId
 * @param {string} path
 * @param {*} value
 */
export function setNodeProperty(rf, nodeId, path, value) {
    rf.setNodes(produce(draft => {
        const node = draft.find(n => n.id === nodeId)

        if (node === undefined)
            throw new Error(`Node ${nodeId} not found`)

        _set(node, path, value)
    }))
}


/**
 * Hook that provides the value of a node property.
 * @param {string} nodeId
 * @param {string} path
 */
export function useNodePropertyValue(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    return useStore(state => _get(state.nodeInternals.get(nodeId), path))
}


/**
 * Hook that provides a setter for a node property.
 * @param {string} nodeId
 * @param {string} path
 * @return {(value: any) => void} 
 */
export function useSetNodeProperty(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const rf = useReactFlow()

    return useCallback(value => setNodeProperty(rf, nodeId, path, value), [nodeId, path, rf])
}


/**
 * Hook that provides the value of a node property and a setter.
 * @param {string} nodeId
 * @param {string} path
 * @param {*} [defaultValue]
 * @return {[ any, (value: any) => void ]}
 */
export function useNodeProperty(nodeId, path, defaultValue) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const value = useNodePropertyValue(nodeId, path)
    const setValue = useSetNodeProperty(nodeId, path)

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [setValue])

    return [value, setValue]
}


export function useNodeHasValidationErrors(nodeId) {

    const nodeDefinition = useDefinition(nodeId)

    const inputs = useNodeInputs(nodeId)

    const hasErrors = useMemo(() => inputs?.map(input => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]

        const inputValidation = inputDefinition?.validateInput?.(input, inputs)
        if (inputValidation)
            return inputValidation

        if (input.mode != "config")
            return false

        const configValidation = inputDefinition?.validateConfiguration?.(input.value)
        if (configValidation)
            return configValidation
    }).some(Boolean), [inputs, nodeDefinition])

    return hasErrors
}


export function useCreateActionNode() {

    const rf = useReactFlow()
    const domNode = useStore(s => s.domNode)

    return useCallback(({
        definition: definitionId,
        position,
        data = {},
        addToGraph = true,
    } = {}) => {

        if (!position) {
            const domNodeBounds = domNode?.getBoundingClientRect()
            position = rf.screenToFlowPosition({
                x: domNodeBounds.x + domNodeBounds.width / 2,
                y: domNodeBounds.y + domNodeBounds.height / 2,
            })
        }

        const definition = nodeDefs[definitionId]

        const createInput = (defId, def, extra = {}) => ({
            id: uniqueId(PREFIX.INPUT),
            definition: defId,
            mode: def.defaultMode,
            ...extra,
        })

        const createOutput = (defId) => ({
            id: uniqueId(PREFIX.OUTPUT),
            definition: defId,
        })

        const newNode = {
            id: uniqueId(PREFIX.NODE),
            type: "action",
            position,
            data: _.merge({
                definition: definitionId,
                inputs: Object.entries(definition.inputs).flatMap(([id, input]) => {
                    if (input.group)
                        return Array(input.groupMin).fill().map(() => createInput(id, input, {
                            name: `New ${input.name}`
                        }))

                    return createInput(id, input)
                }),
                outputs: Object.entries(definition.outputs).flatMap(([id, output]) => {
                    if (output.group)
                        return Array(output.groupMin).fill().map(() => createOutput(id))

                    return createOutput(id)
                }),
            }, data),
        }

        if (addToGraph)
            rf.addNodes(newNode)

        return newNode
    }, [rf, domNode])
}


export function useUpdateInternals(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const update = useUpdateNodeInternals()

    return useCallback(() => update(nodeId), [nodeId, update])
}


export function useModifier(nodeId) {
    const [modifier, setModifier] = useNodeProperty(nodeId, "data.modifier")

    const setNewModifier = useCallback((modifierType, data = {}) => setModifier({
        id: uniqueId(PREFIX.MODIFIER),
        type: modifierType,
        ...data,
    }), [setModifier])

    const clearModifier = useCallback(() => setModifier(null), [setModifier])

    return [modifier, setNewModifier, clearModifier]
}


export function useDisabled(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const [disabled, setDisabled] = useNodeProperty(nodeId, "data.disabled", false)

    const findUpstreamDisabled = (state, nodeId) => {
        const incomingNodeIds = state.edges
            .filter(e => e.target === nodeId)
            .map(e => e.source)

        const upstreamDisabled = incomingNodeIds.some(id => state.nodeInternals.get(id)?.data?.disabled)
        if (upstreamDisabled)
            return true

        return incomingNodeIds.some(id => findUpstreamDisabled(state, id))
    }

    const isUpstreamDisabled = useStore(state => findUpstreamDisabled(state, nodeId))

    const message = disabled ?
        "This node is disabled." :
        isUpstreamDisabled ?
            "This node is disabled because one of its upstream nodes is disabled." :
            null

    return [disabled, isUpstreamDisabled, setDisabled, message]
}

