import { Button, Tooltip } from "@nextui-org/react"
import { useModifier } from "@web/modules/workflow-editor/graph/nodes"
import { object as modDefs } from "@web/modules/workflow-editor/modifiers"
import { TbX } from "react-icons/tb"
import Group from "../../layout/Group"
import ActionNodeHandle from "./ActionNodeHandle"
import { PREFIX } from "shared/prefixes"


export default function NodeModifierWrapper({ children }) {

    const [modifier, , clearModifier] = useModifier()
    const modDef = modDefs[modifier?.type]

    return modifier ?
        <div className="px-3 pb-3 pt-1 rounded-lg bg-gray-200 bg-opacity-50 border-dashed border-1">
            <Group className="justify-between mb-unit-xs !items-stretch">
                <div className="flex flex-col items-start justify-between">
                    <p className="text-default-500 text-xs py-1">
                        {modDef.name}
                    </p>
                    <div className="-mx-5 flex flex-col gap-1">
                        {Object.entries(modDef.inputs ?? {}).map(([id, input]) =>
                            <ActionNodeHandle
                                id={`${PREFIX.MODIFIER_INPUT}:${id}`}
                                type="target"
                                definition={input}
                                key={id}
                            />
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                    <Tooltip content="Remove Modifier" closeDelay={0}>
                        <Button
                            isIconOnly size="sm" variant="light" onPress={clearModifier}
                            className="-mr-2"
                        >
                            <TbX />
                        </Button>
                    </Tooltip>

                    <div className="-mx-5 flex flex-col gap-1">
                        {Object.entries(modDef.outputs ?? {}).map(([id, output]) =>
                            <ActionNodeHandle
                                id={`${PREFIX.MODIFIER_OUTPUT}:${id}`}
                                type="source"
                                definition={output}
                                key={id}
                            />
                        )}
                    </div>
                </div>
            </Group>

            {children}
        </div> :
        children
}
