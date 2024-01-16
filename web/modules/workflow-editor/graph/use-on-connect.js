import { Button, Tooltip } from "@nextui-org/react"
import { useNotifications } from "@web/modules/notifications"
import { object as modifierDefs } from "@web/modules/workflow-editor/modifiers"
import { object as nodeDefs } from "nodes/web"
import { useCallback } from "react"
import { TbAlertTriangle } from "react-icons/tb"
import { addEdge, useStoreApi } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { doTypesMatch, typeLabel } from "shared/types"


export function useOnConnect() {

    const { notify, close: closeNotification } = useNotifications()
    const { getState, setState } = useStoreApi()

    return useCallback(params => {
        if (params.source == params.target)
            return

        const edges = getState().edges

        const isTargetTaken = edges.some(edge => edge.target === params.target && edge.targetHandle === params.targetHandle)
        if (isTargetTaken)
            return

        const getType = (nodeId, handleId) => {
            const node = getState().nodeInternals.get(nodeId)
            return {
                [PREFIX.MODIFIER_INPUT]: modifierDefs[node.data.modifier.type].inputs[node.data.modifier.inputs.find(i => i.id === handleId).type].type,
                [PREFIX.MODIFIER_OUTPUT]: modifierDefs[node.data.modifier.type].outputs[node.data.modifier.outputs.find(o => o.id === handleId).type].type,
                [PREFIX.INPUT]: nodeDefs[node.data.definition].inputs[node.data.inputs.find(i => i.id === handleId).type].type,
                [PREFIX.OUTPUT]: nodeDefs[node.data.definition].outputs[node.data.outputs.find(o => o.id === handleId).type].type,
            }[handleId.split(":")[0]]
        }

        const sourceType = getType(params.source, params.sourceHandle)
        const targetType = getType(params.target, params.targetHandle)

        const connect = (options = {}) => setState({
            edges: addEdge({
                ...params,
                ...options,
            }, edges),
        })

        if (doTypesMatch(sourceType, targetType)) {
            console.debug("Connected", sourceType, "to", targetType)
            return connect()
        }

        console.debug("Tried to connect", sourceType.toLabel(), "with", targetType.toLabel())

        const notifId = notify({
            message: `A ${typeLabel(sourceType)} output can't be connected to a ${typeLabel(targetType)} input.`,
            classNames: {
                icon: "bg-danger",
            },
            content: <Tooltip content="This could prevent your workflow from functioning normally.">
                <Button
                    onPress={() => {
                        connect({ data: { forced: true } })
                        closeNotification(notifId)
                    }}
                    variant="light" size="sm" color="danger" startContent={<TbAlertTriangle />}
                >
                    Connect anyway
                </Button>
            </Tooltip>
        })
    }, [])
}