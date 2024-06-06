import { areSchemasCompatible, createTypeLabel } from "@web/lib/client/type-meta-utils"
import { object as modifierDefs } from "@web/modules/workflow-editor/modifiers"
import { NodeDefinitions } from "packages/client"
import { useCallback } from "react"
import { Edge, OnConnect, useReactFlow } from "reactflow"
import { IdNamespace, createRandomId, parseId } from "shared/utils"
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
        function getDefinition(nodeId: string, handleId: string) {
            const node = rf.getNode(nodeId)

            if (!node)
                throw new Error(`Node with ID ${nodeId} not found`)

            const { namespace } = parseId(handleId)

            if (namespace === IdNamespace.ControlInputHandle
                || namespace === IdNamespace.ControlOutputHandle)
                return modifierDefs[handleId].interfaceDefinition

            const nodeDefinition = NodeDefinitions.get(node.data.definition)
            if (!nodeDefinition)
                throw new Error(`Node definition with ID ${node.data.definition} not found`)

            if (namespace === IdNamespace.InputHandle) {
                const inputDefinitionId = node.data.inputs
                    .find((i: ActionNodeInput) => i.id === handleId)
                    .definition
                return nodeDefinition.inputs[inputDefinitionId]
            }

            if (namespace === IdNamespace.OutputHandle) {
                const outputDefinitionId = node.data.outputs
                    .find((o: ActionNodeOutput) => o.id === handleId)
                    .definition
                return nodeDefinition.outputs[outputDefinitionId]
            }
        }

        const sourceDef = getDefinition(params.source!, params.sourceHandle!)
        const targetDef = getDefinition(params.target!, params.targetHandle!)

        const connect = (forced = false) => {
            rf.addEdges({
                ...params,
                data: { forced },
                id: createRandomId(IdNamespace.Edge),
            } as Edge)
        }

        const areTypesCompatible = sourceDef?.schema && targetDef?.schema
            ? areSchemasCompatible(sourceDef.schema, targetDef.schema)
            : false

        connect(!areTypesCompatible)

        const sourceTypeLabel = sourceDef?.schema
            ? createTypeLabel(sourceDef.schema)
            : "Unknown"
        const targetTypeLabel = targetDef?.schema
            ? createTypeLabel(targetDef.schema)
            : "Unknown"
        console.debug(`Connected ${sourceTypeLabel} to ${targetTypeLabel}`, sourceDef, targetDef)

        if (!areTypesCompatible)
            toast(`You conneced a ${sourceTypeLabel} output to a ${targetTypeLabel} input.`, {
                description: "Since the types don't match, this could lead to unexpected behavior."
            })
    }, [])
}