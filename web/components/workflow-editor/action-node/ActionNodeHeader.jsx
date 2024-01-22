import { Button, Tooltip } from "@nextui-org/react"
import Group from "@web/components/layout/Group"
import { useDefinition, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { TbSettings } from "react-icons/tb"
import { useNodeId, useStoreApi } from "reactflow"


export default function ActionNodeHeader({ withSettings = false }) {

    const id = useNodeId()

    const definition = useDefinition()
    const displayName = useNodePropertyValue(undefined, "data.name") || definition?.name

    const storeApi = useStoreApi()

    return (
        <Group className="w-full justify-between gap-unit-lg text-white p-1 pl-2">
            <Tooltip
                content={definition?.name}
                isDisabled={displayName == definition?.name}
                closeDelay={0}
            >
                <Group className="gap-unit-xs">
                    {definition.icon &&
                        <definition.icon />}
                    <p className="text-sm font-semibold">
                        {displayName}
                    </p>
                </Group>
            </Tooltip>
            <Group className="gap-1 flex-nowrap">
                {withSettings &&
                    <Button
                        size="sm" variant="light" isIconOnly
                        className="nodrag text-white"
                        onPress={() => storeApi.setState({ nodeBeingConfigured: id })}
                    >
                        <TbSettings />
                    </Button>}
            </Group>
        </Group>
    )
}
