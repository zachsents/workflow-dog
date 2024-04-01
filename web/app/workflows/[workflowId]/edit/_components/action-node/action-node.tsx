"use client"

import { Card } from "@web/components/ui/card"
import { cn } from "@web/lib/utils"
import { useDefinition, useNodeColors, useUpdateInternalsWhenNecessary } from "@web/modules/workflow-editor/graph/nodes"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { NodeProps, useStore } from "reactflow"
import NotesWrapper from "./notes-wrapper"
import HandleRenderer from "./handle-renderer"
import ModifierWrapper from "./modifier-wrapper"
import SelectionWrapper from "./selection-wrapper"
import ServiceAccountSelector from "./service-account-selector"


export default function ActionNode({ id, selected }: NodeProps): React.JSX.Element {

    const definition = useDefinition()
    const nodeColors = useNodeColors(undefined, "css")

    useUpdateInternalsWhenNecessary()

    const [settings] = useEditorSettings()

    const hasInputs = useStore(s => s.nodeInternals.get(id)?.data?.inputs?.length > 0)
    const hasOutputs = useStore(s => s.nodeInternals.get(id)?.data?.outputs?.length > 0)

    return definition ?
        <div
            className="relative group/node"
            style={nodeColors as any}
        >
            <NotesWrapper>
                <SelectionWrapper selected={selected}>
                    <ModifierWrapper>
                        <Card className={cn(
                            "flex items-stretch rounded-lg border-slate-300",
                            settings?.verticalLayout ? "flex-col" : "flex-row",
                        )}>
                            {hasInputs &&
                                <HandleRenderer type="input" />}

                            <div className="flex-v center gap-1 border border-y-0 p-2">
                                {definition.icon &&
                                    <div className="bg-[var(--dark-color)] text-primary-foreground px-2 py-1 rounded-sm">
                                        <definition.icon />
                                    </div>}

                                <p className="text-sm text-center leading-tight font-medium max-w-32">
                                    {definition.name}
                                </p>

                                {definition.renderBody &&
                                    <definition.renderBody id={id} />}
                            </div>

                            {hasOutputs &&
                                <HandleRenderer type="output" />}
                        </Card>
                    </ModifierWrapper>

                    {definition?.requiredService &&
                        <ServiceAccountSelector />}
                </SelectionWrapper>
            </NotesWrapper>
        </div> :
        <Card className="p-4">
            Unknown Node
        </Card>
}
