import { uniqueId } from "@web/modules/util"
import { object as modifierDefs } from "@web/modules/workflow-editor/modifiers"
import { DataTypeDefinitions, NodeDefinitions } from "packages/client"
import { useCallback } from "react"
import { Edge, OnConnect, useReactFlow } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { toast } from "sonner"
import { ActionNodeInput, ActionNodeOutput } from "../types"


export function useOnConnect() {

    const rf = useReactFlow()

    return useCallback<OnConnect>(params => {

        // make sure all required params are present
        if (![
            params.source,
            params.target,
            params.sourceHandle,
            params.targetHandle
        ].every(Boolean))
            return void console.error("Missing required params", params)

        // deny self-connections
        if (params.source == params.target)
            return void console.error("Self-connections are not allowed")

        // deny multiple connections to the same target handle
        const isTargetTaken = rf.getEdges()
            .some(edge =>
                edge.target === params.target &&
                edge.targetHandle === params.targetHandle
            )
        if (isTargetTaken)
            return void console.error("Target handle is already taken")

        /**
         * Search for the type of both handles
         */
        function getType(nodeId: string, handleId: string) {
            const node = rf.getNode(nodeId)

            if (!node)
                throw new Error(`Node with ID ${nodeId} not found`)

            const [prefix, restOfId] = handleId.split(":")

            if (prefix === PREFIX.CONTROL_INPUT || prefix === PREFIX.CONTROL_OUTPUT)
                return DataTypeDefinitions.get(modifierDefs[restOfId].type)

            const nodeDefinition = NodeDefinitions.get(node.data.definition)
            if (!nodeDefinition)
                throw new Error(`Node definition with ID ${node.data.definition} not found`)

            if (prefix === PREFIX.INPUT) {
                const inputDefinitionId = node.data.inputs
                    .find((i: ActionNodeInput) => i.id === handleId)
                    .definition
                const typeId = nodeDefinition.inputs[inputDefinitionId].type
                return DataTypeDefinitions.get(typeId)
            }

            if (prefix === PREFIX.OUTPUT) {
                const outputDefinitionId = node.data.outputs
                    .find((o: ActionNodeOutput) => o.id === handleId)
                    .definition
                const typeId = nodeDefinition.outputs[outputDefinitionId].type
                return DataTypeDefinitions.get(typeId)
            }
        }

        const sourceType = getType(params.source!, params.sourceHandle!)
        const targetType = getType(params.target!, params.targetHandle!)

        const connect = (forced = false) => {
            rf.addEdges({
                ...params,
                data: { forced },
                id: uniqueId(PREFIX.EDGE),
            } as Edge)
        }

        // TODO: Implement a function that checks if the types match
        const anyType = "https://data-types.workflow.dog/basic/any"
        const areTypesCompatible = sourceType?.id == targetType?.id
            || sourceType?.id === anyType
            || targetType?.id === anyType

        connect(!areTypesCompatible)
        console.debug(`Connected ${sourceType?.name} to ${targetType?.name}`, sourceType, targetType)

        if (!areTypesCompatible)
            toast(`You conneced a ${sourceType?.name || "Unknown"} output to a ${targetType?.name || "Unknown"} input.`, {
                description: "Since the types don't match, this could lead to unexpected behavior."
            })
    }, [])
}