import { produce } from "immer"
import _ from "lodash"
import { useCallback, useMemo } from "react"
import { PREFIX } from "shared/prefixes"
import { uniqueId } from "../util"
import { useDefinition, useNodeProperty, useNodePropertyValue } from "./nodes"
import { useNodeId, useReactFlow } from "reactflow"
import { useDebouncedCallback } from "@react-hookz/web"



export function useSetInputValue(nodeId, inputId, debounce = 0) {
    nodeId ??= useNodeId()
    const rf = useReactFlow()

    return useDebouncedCallback((newValue) => {
        rf.setNodes(produce(draft => {
            draft.find(n => n.id == nodeId).data.inputs.find(i => i.id == inputId).value = newValue
        }))
    }, [nodeId, rf], debounce)
}


/**
 * @param {string} nodeId
 * @param {"inputs" | "outputs"} dataKey
 * @return {*[]} 
 */
export function useNodeInterfaces(nodeId, dataKey) {
    return useNodePropertyValue(nodeId, `data.${dataKey}`)
}


export function useNodeInputs(nodeId) {
    return useNodeInterfaces(nodeId, "inputs")
}


export function useNodeOutputs(nodeId) {
    return useNodeInterfaces(nodeId, "outputs")
}


/**
 * @param {string} nodeId
 * @param {"inputs" | "outputs"} dataKey
 * @param {string} interfaceId
 * @param {string} path
 * @param {*} defaultValue
 */
export function useInterfaceProperty(nodeId, dataKey, interfaceId, path, defaultValue) {
    return useNodeProperty(nodeId, `data.${dataKey}.id=${interfaceId}.${path}`, defaultValue)
}


/**
 * @param {string} nodeId
 * @param {"inputs" | "outputs"} dataKey
 * @param {string} interfaceId
 * @param {string} path
 */
export function useInterfacePropertyValue(nodeId, dataKey, interfaceId, path) {
    return useNodePropertyValue(nodeId, `data.${dataKey}.id=${interfaceId}.${path}`)
}


export function useInputProperty(nodeId, inputId, path, defaultValue) {
    return useInterfaceProperty(nodeId, "inputs", inputId, path, defaultValue)
}


export function useInputPropertyValue(nodeId, inputId, path) {
    return useInterfacePropertyValue(nodeId, "inputs", inputId, path)
}


export function useOutputProperty(nodeId, outputId, path, defaultValue) {
    return useInterfaceProperty(nodeId, "outputs", outputId, path, defaultValue)
}


export function useOutputPropertyValue(nodeId, outputId, path) {
    return useInterfacePropertyValue(nodeId, "outputs", outputId, path)
}


export function useInputValue(nodeId, inputId, defaultValue) {
    if (inputId == null)
        console.warn("useInputValue called with null inputId")

    return useInputProperty(nodeId, inputId, "value", defaultValue)
}


export function useInputValidation(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)

    const input = useNodePropertyValue(nodeId, `data.inputs.id=${inputId}`)
    const inputs = useNodeInputs(nodeId)

    const error = useMemo(() => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]

        const inputValidation = inputDefinition?.validateInput?.(input, inputs)
        if (inputValidation)
            return inputValidation

        if (input.mode != "config")
            return false

        const configValidation = inputDefinition?.validateConfiguration?.(input.value)
        if (configValidation)
            return configValidation
    }, [input, inputs, nodeDefinition])

    return error
}


export function useDerivedInputs(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)
    const input = useNodePropertyValue(nodeId, `data.inputs.id=${inputId}`)
    const [inputs, setInputs] = useNodeProperty(nodeId, `data.inputs`)

    return useCallback(() => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]
        const derivedInputs = inputDefinition?.deriveInputs?.(input)

        if (!derivedInputs?.length)
            return

        setInputs(produce(inputs, draft => {

            derivedInputs.forEach(derivedInput => {
                const mergeEntries = Object.entries(derivedInput.merge)
                const matchingInput = draft.find(i => mergeEntries.every(([key, value]) => i[key] == value))

                if (matchingInput)
                    return _.merge(matchingInput, derivedInput.data ?? {})

                const newInput = {
                    id: uniqueId(PREFIX.INPUT),
                    derived: true,
                    mode: inputDefinition?.defaultMode,
                    ...derivedInput.merge,
                    ...derivedInput.data,
                }

                const newInputDefinition = nodeDefinition?.inputs[newInput.definition]
                if (newInputDefinition?.group) {
                    const inputCount = draft.filter(i => i.definition == newInput.definition).length
                    if (inputCount >= newInputDefinition?.groupMax)
                        return
                }

                draft.push(newInput)
            })
        }))
    }, [input, inputs, nodeDefinition, setInputs])
}