import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { list as modList } from "@web/modules/workflow-editor/modifiers"
import { useMemo } from "react"
import { PREFIX } from "shared/prefixes"
import Group from "../../layout/Group"
import ActionNodeHandle from "./ActionNodeHandle"


export default function NodeModifierWrapper({ children }) {

    const [modifiers] = useNodeProperty(undefined, "data.controlModifiers")
    const hasAnyModifiers = useMemo(() => Object.values(modifiers || {}).some(Boolean), [modifiers])

    const controlInputs = useMemo(() => modList.filter(mod => mod.handleType === "input" && modifiers?.[mod.id]), [modifiers])
    const controlOutputs = useMemo(() => modList.filter(mod => mod.handleType === "output" && modifiers?.[mod.id]), [modifiers])

    return hasAnyModifiers ?
        <div className="px-3 pb-3 pt-1 rounded-lg bg-gray-200 bg-opacity-50 border-dashed border-1">
            <p className="text-default-500 text-xs py-1">
                Control Modifiers
            </p>
            <Group className="justify-between mb-unit-xs !items-stretch">
                <div className="-mx-5 flex flex-col items-start gap-1">
                    {controlInputs.map(control =>
                        <ActionNodeHandle
                            id={`${PREFIX.CONTROL_INPUT}:${control.id}`}
                            type="target"
                            definition={control}
                            key={control.id}
                        />
                    )}
                </div>

                <div className="-mx-5 flex flex-col items-end gap-1">
                    {controlOutputs.map(control =>
                        <ActionNodeHandle
                            id={`${PREFIX.CONTROL_OUTPUT}:${control.id}`}
                            type="source"
                            definition={control}
                            key={control.id}
                        />
                    )}
                </div>
            </Group>

            {children}
        </div> :
        children
}
