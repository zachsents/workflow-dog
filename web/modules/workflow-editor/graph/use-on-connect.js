import { Button, Tooltip } from "@nextui-org/react"
import { useNotifications } from "@web/modules/notifications"
import { object as modifierDefs } from "@web/modules/workflow-editor/modifiers"
import { object as nodeDefs } from "nodes/web"
import { useCallback } from "react"
import { TbAlertTriangle } from "react-icons/tb"
import { useReactFlow } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { doTypesMatch, typeLabel } from "shared/types"


export function useOnConnect() {

    const rf = useReactFlow()
    const { notify, close: closeNotification } = useNotifications()

    return useCallback(params => {
        if (params.source == params.target)
            return

        const isTargetTaken = rf.getEdges()
            .some(edge => edge.target === params.target && edge.targetHandle === params.targetHandle)
        if (isTargetTaken)
            return

        const getType = (nodeId, handleId) => {
            const node = rf.getNode(nodeId)
            const [prefix, restOfId] = handleId.split(":")

            if (prefix === PREFIX.MODIFIER_INPUT)
                return modifierDefs[node.data.modifier.type].inputs[restOfId].type

            if (prefix === PREFIX.MODIFIER_OUTPUT)
                return modifierDefs[node.data.modifier.type].outputs[restOfId].type

            if (prefix === PREFIX.INPUT)
                return nodeDefs[node.data.definition].inputs[node.data.inputs.find(i => i.id === handleId).definition].type

            if (prefix === PREFIX.OUTPUT)
                return nodeDefs[node.data.definition].outputs[node.data.outputs.find(o => o.id === handleId).definition].type
        }

        const sourceType = getType(params.source, params.sourceHandle)
        const targetType = getType(params.target, params.targetHandle)

        if (doTypesMatch(sourceType, targetType)) {
            console.debug("Connected", sourceType, "to", targetType)
            rf.addEdges([params])
            return
        }

        console.debug("Tried to connect", typeLabel(sourceType), "with", typeLabel(targetType))

        const notifId = notify({
            message: `A ${typeLabel(sourceType)} output can't be connected to a ${typeLabel(targetType)} input.`,
            classNames: {
                icon: "bg-danger",
            },
            content: <Tooltip content="This could prevent your workflow from functioning normally.">
                <Button
                    onPress={() => {
                        rf.addEdges([{
                            ...params,
                            data: { forced: true }
                        }])
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