import { Button, Tooltip } from "@nextui-org/react"
import Group from "@web/components/layout/Group"
import { useDefinition, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { TbSettings } from "react-icons/tb"
import { useNodeId, useStoreApi } from "reactflow"


export default function ActionNodeHeader({ withSettings = false }) {

    const id = useNodeId()

    const definition = useDefinition()
    const name = useNodePropertyValue(undefined, "data.name")
    const displayName = name || definition?.name

    const storeApi = useStoreApi()

    // const nodeName = useStore(s => s.nodeInternals.get(id).data.name)

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
                    <div>
                        <p className="text-sm font-semibold">
                            {displayName}
                        </p>
                        {!!name && <p className="text-xs opacity-75">
                            {definition?.name}
                        </p>}
                    </div>
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
