import { Button, Tooltip } from "@nextui-org/react"
import { useNotifications } from "@web/modules/notifications"
import { object as modifierDefs } from "@web/modules/workflow-editor/modifiers"
import { doTypesMatch } from "data-types"
import { object as typeMap } from "data-types/common"
import { NodeDefinitions } from "packages/web"
import { useCallback } from "react"
import { TbAlertTriangle } from "react-icons/tb"
import { useReactFlow } from "reactflow"
import { PREFIX } from "shared/prefixes"
import { uniqueId } from "../util"


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

            if (prefix === PREFIX.CONTROL_INPUT || prefix === PREFIX.CONTROL_OUTPUT)
                return modifierDefs[restOfId].type

            if (prefix === PREFIX.INPUT)
                return NodeDefinitions.asMap.get(node.data.definition).inputs[node.data.inputs.find(i => i.id === handleId).definition].type

            if (prefix === PREFIX.OUTPUT)
                return NodeDefinitions.asMap.get(node.data.definition).outputs[node.data.outputs.find(o => o.id === handleId).definition].type
        }

        const sourceType = getType(params.source, params.sourceHandle)
        const targetType = getType(params.target, params.targetHandle)

        const connect = (forced = false) => {
            rf.addEdges({
                ...params,
                data: { forced },
                id: uniqueId(PREFIX.EDGE),
            })
        }

        if (doTypesMatch(sourceType, targetType)) {
            console.debug("Connected", sourceType, "to", targetType)
            connect()
            return
        }

        console.debug("Tried to connect", typeMap[sourceType], "with", typeMap[targetType])

        const notifId = notify({
            message: `A ${typeMap[sourceType]?.name || "Any"} output can't be connected to a ${typeMap[targetType]?.name || "Any"} input.`,
            classNames: {
                icon: "bg-danger",
            },
            content: <Tooltip content="This could prevent your workflow from functioning normally.">
                <Button
                    onPress={() => {
                        connect(true)
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