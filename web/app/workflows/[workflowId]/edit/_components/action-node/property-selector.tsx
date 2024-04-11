"use client"

import { Button } from "@ui/button"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList
} from "@ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@ui/tooltip"
import { useDialogState } from "@web/lib/client/hooks"
import { createOutput, useCreateActionNode } from "@web/modules/workflow-editor/graph/nodes"
import { produce } from "immer"
import { DataTypeDefinitions } from "packages/client"
import { TbChevronDown } from "react-icons/tb"
import { useNodeId, useReactFlow } from "reactflow"


const decomposeObjectDefinitionId = "https://nodes.workflow.dog/basic/decompose-object"


interface PropertySelectorProps {
    handleId: string
    dataTypeId: string
}

export default function PropertySelector({ handleId, dataTypeId }: PropertySelectorProps) {

    const popover = useDialogState()

    const rf = useReactFlow()

    const nodeId = useNodeId()
    const dataType = DataTypeDefinitions.get(dataTypeId)

    const properties = Object.keys((dataType?.schema as any).shape ?? {})

    const createNode = useCreateActionNode()

    const selectProperty = (property: string) => {
        const connectedDecomposer = rf.getNodes()
            .find(node => {
                if (node.data?.definition !== decomposeObjectDefinitionId)
                    return false

                return rf.getEdges()
                    .some(e => e.target === node.id && e.source === nodeId && e.sourceHandle === handleId)
            })

        if (!connectedDecomposer) {
            const ourNode = rf.getNode(nodeId!)
            const position = { ...ourNode!.position }
            position.x += (ourNode?.width ?? 100) + 100

            createNode({
                definition: decomposeObjectDefinitionId,
                position,
                connect: [{
                    source: nodeId!,
                    sourceHandle: handleId,
                    targetHandleType: "object",
                }],
                addOutputs: [{
                    outputDefinitionId: "properties",
                    extra: { name: property }
                }],
            })
            return void popover.close()
        }

        const newOutput = createOutput("properties", { name: property })

        rf.setNodes(produce(draft => {
            draft.find(node => node.id === connectedDecomposer.id)
                ?.data?.outputs.push(newOutput)
        }))

        popover.close()
    }

    return (
        <Popover {...popover.dialogProps}>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                size="sm" variant="outline"
                                className="rounded-full shrink-0 w-auto h-auto p-1 aspect-square"
                            >
                                <TbChevronDown />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="text-xs">
                            Select property
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent align="start" className="w-[240px] p-0">
                <Command>
                    <CommandInput placeholder="Search properties..." />
                    <CommandList>
                        <CommandEmpty>No properties found.</CommandEmpty>
                        {properties.map(property => (
                            <CommandItem
                                key={property}
                                value={property}
                                onSelect={selectProperty}
                            >
                                {property}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}