"use client"

import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { cn } from "@web/lib/utils"
import { useDefinition, useNodeColors, useUpdateInternalsWhenNecessary } from "@web/modules/workflow-editor/graph/nodes"
import { TbChevronDown } from "react-icons/tb"
import { NodeProps } from "reactflow"
import HandleRenderer from "./handle-renderer"
import ModifierWrapper from "./modifier-wrapper"
import NotesWrapper from "./notes-wrapper"
import SelectionWrapper from "./selection-wrapper"
import ServiceAccountSelector from "./service-account-selector"


export default function ActionNode({ id, selected }: NodeProps): React.JSX.Element {

    const definition = useDefinition()
    const nodeColors = useNodeColors(undefined, "css")

    useUpdateInternalsWhenNecessary()

    const hasInputs = Object.keys(definition?.inputs || {}).length > 0
    const hasOutputs = Object.keys(definition?.outputs || {}).length > 0

    return definition ?
        <div
            className="relative group/node"
            style={nodeColors as any}
        >
            <NotesWrapper>
                <SelectionWrapper selected={selected}>
                    <ModifierWrapper>
                        <Card className="rounded-lg">
                            <div className="flex items-center">
                                <div className="self-stretch border-r">
                                    <div
                                        className={cn(
                                            "flex items-center gap-2 bg-[var(--base-color)] text-white px-3 py-1",
                                            hasOutputs ? "rounded-tl-md" : "rounded-t-md",
                                        )}
                                    >
                                        <div className="text-xl">
                                            {definition.icon &&
                                                <definition.icon />}
                                        </div>

                                        <p className="text-md leading-tight font-medium mr-2">
                                            {definition.name}
                                        </p>

                                        {definition.badge &&
                                            <p className="flex center px-2 bg-primary-foreground text-[var(--base-color)] rounded-full text-xs font-bold">
                                                {definition.badge}
                                            </p>}
                                    </div>

                                    <div className="flex-v items-stretch px-2 pb-2 pt-1">
                                        {hasInputs &&
                                            <HandleRenderer type="input" />}
                                        {definition.renderBody &&
                                            <definition.renderBody id={id} />}
                                        {/* WIP */}
                                        {definition.renderOptions &&
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-auto h-auto px-2 py-1 text-muted-foreground text-xs flex center gap-2 relative top-2 opacity-0 group-hover/node:opacity-100",
                                                    selected && "opacity-100",
                                                )}
                                            >
                                                {/* <TbSettings /> */}
                                                Options
                                                <TbChevronDown />
                                            </Button>}
                                    </div>
                                </div>

                                {hasOutputs &&
                                    <div className="p-1">
                                        <HandleRenderer type="output" />
                                    </div>}
                            </div>
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
