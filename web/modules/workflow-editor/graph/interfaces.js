import { useDebouncedCallback } from "@react-hookz/web"
import { produce } from "immer"
import { useMemo } from "react"
import { useNodeId, useReactFlow, useStore } from "reactflow"
import { useDefinition, useNodePropertyValue } from "./nodes"



export function useSetInputValue(nodeId, inputId, debounce = 0) {
    nodeId ??= useNodeId()
    const rf = useReactFlow()

    return useDebouncedCallback((newValue) => {
        rf.setNodes(produce(draft => {
            draft.find(n => n.id == nodeId).data.inputs.find(i => i.id == inputId).value = newValue
        }))
    }, [nodeId, rf], debounce)
}


export function useInputValidation(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)

    const input = useNodePropertyValue(nodeId, `data.inputs.id=${inputId}`)
    const inputs = useStore(s => s.nodeInternals.get(nodeId)?.data?.inputs)

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
