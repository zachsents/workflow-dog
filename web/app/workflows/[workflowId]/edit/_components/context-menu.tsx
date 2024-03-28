"use client"

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
import { cn } from "@web/lib/utils"
import { stringHash } from "@web/modules/util"
import { useCreateActionNode } from "@web/modules/workflow-editor/graph/nodes"
import { useEditorStore, useEditorStoreState } from "@web/modules/workflow-editor/store"
import { NodeDefinitions } from "packages/web"
import { useMemo } from "react"
import { useReactFlow } from "reactflow"


export default function ContextMenu() {

    const rf = useReactFlow()

    const position = useEditorStore(s => s.contextMenu?.position)
    const [isOpen, setOpen] = useEditorStoreState<boolean>("contextMenu.isOpen")

    const createNode = useCreateActionNode()
    const addNode = (definitionId: string) => {
        if (!position)
            return

        createNode({
            definition: definitionId,
            position: rf.screenToFlowPosition(position),
        })
        setOpen(false)
    }

    // const { value: pinned } = useLocalStorageValue("pinnedNodes")

    const popoverKey = useMemo(() => stringHash(position), [position])

    return (<>
        <Popover open={isOpen} onOpenChange={setOpen} key={popoverKey}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "fixed w-3 h-3 bg-primary rounded-full transition-opacity -translate-x-1/2 -translate-y-1/2 pointer-events-none",
                        !isOpen && "opacity-0",
                    )}
                    style={{
                        top: `${position?.y}px`,
                        left: `${position?.x}px`,
                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-1">
                <Command>
                    <CommandInput placeholder="Search nodes..." />
                    <CommandList>
                        <CommandEmpty>No nodes found.</CommandEmpty>
                        {NodeDefinitions.asArray.map(definition => (
                            <CommandItem
                                key={definition.id}
                                value={definition.id}
                                onSelect={currentValue => addNode(currentValue)}
                            >
                                {definition.icon && <definition.icon className="mr-2" />}
                                {definition.name}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    </>)
}
