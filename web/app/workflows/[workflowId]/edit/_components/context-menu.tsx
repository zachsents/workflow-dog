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
import { Badge } from "@web/components/ui/badge"
import { cn } from "@web/lib/utils"
import { stringHash } from "@web/modules/util"
import { useCreateActionNode } from "@web/modules/workflow-editor/graph/nodes"
import { useSearchNodes } from "@web/modules/workflow-editor/node-search"
import { useEditorStore, useEditorStoreState } from "@web/modules/workflow-editor/store"
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

    const { searchResults, onSearchChange, inputRef } = useSearchNodes()

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
            <PopoverContent className="w-[300px] p-1">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search actions..."
                        onValueChange={onSearchChange}
                        ref={inputRef}
                    />
                    <CommandList>
                        <CommandEmpty>No actions found.</CommandEmpty>
                        {searchResults.map(({ item: definition }) => (
                            <CommandItem
                                key={definition.id}
                                value={definition.id}
                                onSelect={currentValue => addNode(currentValue)}
                                className="flex between gap-2 flex-nowrap"
                                style={{ color: definition.color }}
                            >
                                <div className="flex items-center gap-2">
                                    {definition.icon &&
                                        <definition.icon />}
                                    <p className="text-foreground">
                                        {definition.name}
                                    </p>
                                </div>

                                {definition.badge &&
                                    <Badge variant="secondary" className="text-current">
                                        {definition.badge}
                                    </Badge>}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    </>)
}
