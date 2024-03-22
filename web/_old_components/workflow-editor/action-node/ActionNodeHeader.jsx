import { Button, Tooltip } from "@nextui-org/react"
import Group from "@web/_old_components/layout/Group"
import { useDefinition, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { useEditorStoreApi } from "@web/modules/workflow-editor/store"
import { TbInfoCircle } from "react-icons/tb"
import { useNodeId } from "reactflow"


export default function ActionNodeHeader({ withSettings = false }) {

    const id = useNodeId()

    const definition = useDefinition()
    const name = useNodePropertyValue(undefined, "data.name")
    const displayName = name || definition?.name

    const editorStore = useEditorStoreApi()

    return (
        <Group className="group w-full bg-[var(--dark-color)] justify-between gap-unit-lg text-white p-1 pl-2">
            <Tooltip
                content={definition?.name}
                isDisabled={displayName == definition?.name}
                closeDelay={0}
            >
                <Group className="gap-unit-xs">
                    {definition.icon &&
                        <definition.icon className="text-lg stroke-[1.5px]" />}
                    <div>
                        <p className="text-md font-semibold">
                            {displayName}
                        </p>
                        {!!name &&
                            <p className="text-sm opacity-75">
                                {definition?.name}
                            </p>}
                    </div>
                </Group>
            </Tooltip>
            <Group className="gap-1 flex-nowrap self-stretch items-stretch">
                {withSettings &&
                    <Button
                        size="sm" variant="light" isIconOnly
                        className="nodrag text-white h-auto opacity-0 group-hover:opacity-100 rounded-md"
                        onPress={() => editorStore.setState({ nodeBeingConfigured: id })}
                        onMouseDown={ev => ev.stopPropagation()}
                    >
                        <TbInfoCircle />
                    </Button>}
            </Group>
        </Group>
    )
}
