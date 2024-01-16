import { Button, Tooltip } from "@nextui-org/react"
import { useModifier } from "@web/modules/workflow-editor/graph/nodes"
import { object as modDefs } from "@web/modules/workflow-editor/modifiers"
import { TbX } from "react-icons/tb"
import Group from "../layout/Group"
import ActionNodeHandle from "./ActionNodeHandle"


export default function NodeModifierWrapper({ children }) {

    const [modifier, , clearModifier] = useModifier()

    return modifier ?
        <div className="px-3 pb-3 pt-1 rounded-xl bg-gray-200 bg-opacity-50 border-dashed border-1">
            <Group className="justify-between -mr-2 mb-unit-xs">
                <div className="flex flex-col items-start">
                    <p className="text-default-500 text-xs py-1">
                        {modDefs[modifier.type].name}
                    </p>
                    <div className="-mx-5">
                        <ActionNodeHandle
                            id={modifier.id}
                            type="target"
                            definition={Object.values(modDefs[modifier.type].inputs)[0]}
                        />
                    </div>
                </div>
                <Tooltip content="Remove Modifier" closeDelay={0}>
                    <Button isIconOnly size="sm" variant="light" onPress={clearModifier}>
                        <TbX />
                    </Button>
                </Tooltip>
            </Group>

            {children}
        </div> :
        children
}
