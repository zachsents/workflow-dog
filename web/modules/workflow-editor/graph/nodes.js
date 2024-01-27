import { useDebouncedCallback } from "@react-hookz/web"
import Color from "color"
import { produce } from "immer"
import _ from "lodash"
import { object as nodeDefs } from "nodes/web"
import { useCallback, useEffect, useMemo } from "react"
import { useNodeId, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow"
import { PREFIX } from "shared/prefixes"
import colors from "tailwindcss/colors"
import { uniqueId } from "../util"
import { stringHash } from "@web/modules/util"


/**
 * @param {string} [nodeId]
 */
export function useDefinition(nodeId) {
    nodeId ??= useNodeId()
    const definitionId = useStore(s => s.nodeInternals.get(nodeId)?.data?.definition)
    return useMemo(() => nodeDefs[definitionId], [definitionId])
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

        _.set(node, path, value)
    }))
}


/**
 * Hook that provides the value of a node property.
 * @param {string} nodeId
 * @param {string} path
 */
export function useNodePropertyValue(nodeId, path) {
    nodeId ??= useNodeId()
    return useStore(s => _.get(s.nodeInternals.get(nodeId), path))
}


/**
 * Hook that provides a setter for a node property.
 * @param {string} nodeId
 * @param {string} path
 * @param {object} [options]
 * @param {number} [options.debounce=0]
 * @return {(value: any) => void} 
 */
export function useSetNodeProperty(nodeId, path, {
    debounce = 0,
} = {}) {
    nodeId ??= useNodeId()
    const rf = useReactFlow()
    return useDebouncedCallback(value => setNodeProperty(rf, nodeId, path, value), [nodeId, path, rf], debounce)
}


/**
 * Hook that provides the value of a node property and a setter.
 * @param {string} nodeId
 * @param {string} path
 * @param {object} [options]
 * @param {any} [options.defaultValue]
 * @param {number} [options.debounce=0]
 * @return {[ any, (value: any) => void ]}
 */
export function useNodeProperty(nodeId, path, {
    defaultValue,
    debounce = 0,
} = {}) {
    const value = useNodePropertyValue(nodeId, path)
    const setValue = useSetNodeProperty(nodeId, path, { debounce })

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [value, setValue, defaultValue])

    return [value, setValue]
}


export function useNodeHasValidationErrors(nodeId) {
    nodeId ??= useNodeId()

    const nodeDefinition = useDefinition(nodeId)

    const inputs = useStore(s => s.nodeInternals.get(nodeId)?.data?.inputs)

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

    /**
     * @param {object} options
     * @param {string} options.definition
     * @param {{ x: number, y: number }} [options.position]
     * @param {object} [options.data]
     * @param {boolean} [options.addToGraph=true]
     * @param {Partial<import("reactflow").Edge & { sourceHandleType: string, targetHandleType: string }>[]} connect
     */
    const createNode = ({
        definition: definitionId,
        position,
        data = {},
        addToGraph = true,
        connect = [],
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
            mode: def.defaultMode || "handle",
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
                        return Array(input.groupMin ?? 0).fill().map(() => createInput(id, input, {
                            name: `New ${input.name}`
                        }))

                    return createInput(id, input)
                }),
                outputs: Object.entries(definition.outputs).flatMap(([id, output]) => {
                    if (output.group)
                        return Array(output.groupMin ?? 0).fill().map(() => createOutput(id))

                    return createOutput(id)
                }),
            }, data),
        }

        if (addToGraph)
            rf.addNodes(newNode)

        const newEdges = connect.map(params => ({
            id: uniqueId(PREFIX.EDGE),
            ..._.omit(params, ["sourceHandleType", "targetHandleType"]),
            ..."source" in params && {
                target: newNode.id,
                targetHandle: newNode.data.inputs.find(i => i.definition === params.targetHandleType).id,
            },
            ..."target" in params && {
                source: newNode.id,
                sourceHandle: newNode.data.outputs.find(o => o.definition === params.sourceHandleType).id,
            },
        }))

        if (newEdges.length > 0)
            rf.addEdges(newEdges)

        return newNode
    }

    return useCallback(createNode, [rf, domNode])
}


export function useUpdateInternals(nodeId) {
    nodeId ??= useNodeId()
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



export function useUpdateInternalsWhenNecessary(nodeId) {
    nodeId ??= useNodeId()

    const updateInternals = useUpdateInternals()

    const handlesHash = useStore(s => {
        const node = s.nodeInternals.get(nodeId)
        return stringHash([
            node.data.inputs?.map(input => _.pick(input, ["id", "hidden", "mode"])),
            node.data.outputs?.map(output => _.pick(output, ["id", "hidden"])),
            node.data.modifier?.id,
        ])
    })

    useEffect(() => {
        updateInternals()
    }, [handlesHash])

    const selected = useStore(s => s.nodeInternals.get(nodeId)?.selected)

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateInternals()
        }, 75)

        const cleanup = () => clearInterval(intervalId)
        setTimeout(cleanup, 400)
        return cleanup
    }, [selected])
}



export function useDisabled(nodeId) {
    nodeId ??= useNodeId()

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


/**
 * @param {string} nodeId
 * @param {"json" | "css"} [mode="json"]
 */
export function useNodeColors(nodeId, mode = "json") {

    const definition = useDefinition(nodeId)

    const baseColor = definition?.color || colors.gray[500]
    const darkColor = useMemo(() => Color(baseColor).lightness(20).hex(), [baseColor])
    const lightColor = useMemo(() => Color(baseColor).lightness(90).hex(), [baseColor])

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
}