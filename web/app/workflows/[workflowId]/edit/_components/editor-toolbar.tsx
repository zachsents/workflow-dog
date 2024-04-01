"use client"

import Kbd from "@web/components/kbd"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@web/components/ui/dialog"
import { Input } from "@web/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@web/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { useDialogState, useLogEffect } from "@web/lib/client/hooks"
import { useCreateActionNode, useNodeDefinitionColors } from "@web/modules/workflow-editor/graph/nodes"
import { NodeDefinitions } from "packages/client"
import { useMemo, useRef, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { TbChevronsUp } from "react-icons/tb"
import Fuse, { FuseResult } from "fuse.js"
import { useDebouncedCallback } from "@react-hookz/web"


const fixedNodes = [
    "https://nodes.workflow.dog/basic/text",
    "https://nodes.workflow.dog/basic/number",
]


type NodeSearchResult = FuseResult<typeof NodeDefinitions.asArray[0]>


export default function EditorToolbar() {

    const inputRef = useRef<HTMLInputElement>(null)

    const popover = useDialogState()
    const dialog = useDialogState()

    useHotkeys("/", () => {
        inputRef.current?.focus()
    }, {
        preventDefault: true,
    })

    const createNode = useCreateActionNode()
    const addNode = (defId: string) => {
        createNode({
            definition: defId,
        })

        if (inputRef.current) {
            inputRef.current.blur()
            inputRef.current.value = ""
        }
        popover.close()
        dialog.close()
    }

    const [searchResults, setSearchResults] = useState<NodeSearchResult[]>([])

    const fuseIndex = useMemo(() => new Fuse(NodeDefinitions.asArray, {
        includeScore: true,
        keys: ["name", "description", "tags"],
    }), [])

    const onSearchChange = useDebouncedCallback((query: string) => {
        setSearchResults(
            fuseIndex.search(query, { limit: 8 })
        )
    }, [fuseIndex], 200)

    return (
        <Card className="p-1 flex items-stretch flex-nowrap gap-2 pointer-events-auto shadow-lg">
            {fixedNodes.map(definitionId => {
                const definition = NodeDefinitions.get(definitionId)!
                if (!definition) return null

                return (
                    <TooltipProvider delayDuration={0} key={definitionId}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon" variant="secondary"
                                    onClick={() => addNode(definitionId)}
                                    className="shrink-0"
                                >
                                    <definition.icon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{definition.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            })}

            <Popover
                {...popover.dialogProps}
                open={popover.isOpen && searchResults.length > 0}
            >
                <PopoverAnchor>
                    <div className="relative">
                        <Input
                            placeholder="Search tasks..."
                            onFocus={ev => {
                                popover.open()
                                ev.currentTarget.select()
                            }}
                            onClick={popover.open}
                            onChange={ev => onSearchChange(ev.currentTarget.value)}
                            className="peer/input"
                            ref={inputRef}
                        />

                        <Kbd className="absolute top-1/2 -translate-y-1/2 right-0 mx-2 transition-opacity peer-focus/input:opacity-0">/</Kbd>
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    side="top" align="center"
                    className="p-1 w-[240px] shadow-md flex flex-col-reverse items-stretch gap-1"
                    onOpenAutoFocus={ev => ev.preventDefault()}
                >
                    {searchResults.map(result =>
                        <SearchResult
                            key={result.item.id}
                            result={result}
                            onClick={() => addNode(result.item.id)}
                        />
                    )}
                </PopoverContent>
            </Popover>

            {/* <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" onClick={dialog.open}>
                            <TbChevronsUp />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Explore more tasks</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider> */}

            <Dialog {...dialog.dialogProps}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Search all tasks
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </Card >
    )
}


interface SearchResultProps extends React.ComponentProps<"button"> {
    result: NodeSearchResult
}

function SearchResult({
    result,
    ...props
}: SearchResultProps) {
    const { baseColor } = useNodeDefinitionColors(result.item.id, "json")

    return (
        <button
            className="flex items-center gap-2 text-sm rounded-sm px-2 py-1 hover:bg-secondary"
            {...props}
        >
            <result.item.icon
                className="p-1 rounded-sm text-primary-foreground shrink-0 text-xl"
                style={{
                    backgroundColor: baseColor,
                }}
            />
            <div className="flex-1 text-left">
                <p>
                    {result.item.name}
                </p>
                <p className="text-muted-foreground text-xs">
                    {result.item.description}
                </p>
            </div>
        </button>
    )
}