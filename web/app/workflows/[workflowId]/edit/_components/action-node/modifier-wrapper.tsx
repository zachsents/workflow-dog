import { useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { list as modifiersList } from "@web/modules/workflow-editor/modifiers"
import { useMemo } from "react"
import { PREFIX } from "shared/prefixes"
import ActionNodeHandle from "./handle"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"


export default function ModifierWrapper({ children }: { children: any }) {

    const [settings] = useEditorSettings()

    const modifiers = useNodePropertyValue(undefined, "data.controlModifiers")
    const hasAnyModifiers = useMemo(
        () => Object.values(modifiers || {}).some(Boolean),
        [modifiers]
    )

    const controlInputs = useMemo(
        () => modifiersList.filter(mod => mod.handleType === "input"
            && modifiers?.[mod.id]),
        [modifiers]
    )
    const controlOutputs = useMemo(
        () => modifiersList.filter(mod => mod.handleType === "output"
            && modifiers?.[mod.id]),
        [modifiers]
    )

    const inputComponent =
        <div className="flex flex-col items-start gap-1 -translate-x-5">
            {controlInputs.map(control =>
                <ActionNodeHandle
                    id={`${PREFIX.CONTROL_INPUT}:${control.id}`}
                    type="input"
                    definition={control}
                    key={control.id}
                />
            )}
        </div>

    const outputComponent =
        <div className="flex flex-col items-end gap-1 translate-x-5">
            {controlOutputs.map(control =>
                <ActionNodeHandle
                    id={`${PREFIX.CONTROL_OUTPUT}:${control.id}`}
                    type="output"
                    definition={control}
                    key={control.id}
                />
            )}
        </div>

    return hasAnyModifiers ?
        <div className="px-3 py-2 rounded-lg bg-slate-200 bg-opacity-60 flex-v items-stretch gap-1">
            <p className="text-muted-foreground text-xs">
                Control Modifiers
            </p>

            {settings?.verticalLayout ?
                inputComponent :
                <div className="flex justify-between items-stretch mb-2">
                    {inputComponent}
                    {outputComponent}
                </div>}

            {children}

            {settings?.verticalLayout ?
                outputComponent :
                null}
        </div> :
        children
}