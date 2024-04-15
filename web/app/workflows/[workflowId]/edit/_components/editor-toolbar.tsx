"use client"

import Kbd from "@web/components/kbd"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { Input } from "@web/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@web/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { useDialogState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useCreateActionNode, useNodeDefinitionColors } from "@web/modules/workflow-editor/graph/nodes"
import { AllNodeDefinitionTags, useSearchNodes, type NodeSearchResult } from "@web/modules/workflow-editor/node-search"
import { NodeDefinitions } from "packages/client"
import { useHotkeys } from "react-hotkeys-hook"
import { TbX } from "react-icons/tb"


const fixedNodes = [
    "https://nodes.workflow.dog/basic/text",
    "https://nodes.workflow.dog/basic/number",
]


export default function EditorToolbar() {

    const popover = useDialogState()

    const {
        searchResults,
        onSearchChange,
        inputRef,
        tagSearchResults,
        filters,
        hasQuery,
    } = useSearchNodes({ withFilters: true })

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
    }

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
                open={popover.isOpen}
            >
                <PopoverAnchor>
                    <div className="relative">
                        <Input
                            placeholder="Search actions..."
                            onFocus={ev => {
                                popover.open()
                                ev.currentTarget.select()
                            }}
                            onClick={popover.open}
                            onChange={ev => onSearchChange(ev.currentTarget.value)}
                            className="peer/input w-[280px]"
                            ref={inputRef}
                        />

                        <Kbd className="absolute top-1/2 -translate-y-1/2 right-0 mx-2 transition-opacity peer-focus/input:opacity-0">/</Kbd>
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    side="top" align="center"
                    className="p-4 w-[540px] h-[380px] shadow-lg grid grid-cols-[auto_180px] gap-4"
                    onOpenAutoFocus={ev => ev.preventDefault()}
                    onKeyDown={ev => {
                        if (ev.key !== "Enter")
                            inputRef.current?.focus()
                    }}
                >
                    <div className="flex-v items-stretch gap-1 overflow-y-scroll h-full pr-2">
                        <p className="text-xs text-muted-foreground">
                            {hasQuery ? "Search results" : "Common actions"}
                        </p>

                        {hasQuery
                            ? searchResults.map(result =>
                                <SearchResult
                                    key={result.item.id}
                                    result={result}
                                    onClick={() => addNode(result.item.id)}
                                />
                            )
                            : NodeDefinitions.asArray
                                .filter(definition => Array.from(filters).every(tag => definition.tags.includes(tag)))
                                .slice(0, 10)
                                .map(definition =>
                                    <SearchResult
                                        key={definition.id}
                                        result={{
                                            item: definition,
                                            score: 0,
                                            refIndex: 0,
                                        }}
                                        onClick={() => addNode(definition.id)}
                                    />

                                )}
                    </div>

                    <div className="flex-v items-stretch gap-2 h-full overflow-y-scroll">
                        <p className="font-bold text-sm">
                            Filter actions
                        </p>

                        {filters.size > 0 && <>
                            <p className="text-xs text-muted-foreground">
                                Selected filters
                            </p>
                            <div className="flex-v items-stretch gap-2">
                                {Array.from(filters).map(tag =>
                                    <button
                                        onClick={() => filters.delete(tag)}
                                        className="rounded-full px-4 py-1 bg-violet-200 hover:bg-red-200 flex center gap-4 font-bold transition-colors text-sm"
                                        key={tag}
                                    >
                                        {tag}
                                        <TbX />
                                    </button>
                                )}
                            </div>
                        </>}


                        <p className="text-xs text-muted-foreground">
                            {hasQuery ? "Search results" : "Common tags"}
                        </p>

                        <div className="grid grid-cols-2 gap-x-1 gap-y-2 flex-wrap">
                            {hasQuery
                                ? tagSearchResults.map((tag, i) =>
                                    <TagSearchResult
                                        onClick={() => filters.add(tag.item)}
                                        big={i < 1}
                                        key={tag.item}
                                    >
                                        {tag.item}
                                    </TagSearchResult>
                                )
                                : AllNodeDefinitionTags
                                    .filter(tag => !filters.has(tag))
                                    .slice(0, 10)
                                    .map((tag, i) =>
                                        <TagSearchResult
                                            onClick={() => filters.add(tag)}
                                            big={i < 5}
                                            key={tag}
                                        >
                                            {tag}
                                        </TagSearchResult>
                                    )}
                        </div>
                    </div>
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

            {/* <Dialog {...dialog.dialogProps}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Search all tasks
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog> */}
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


interface TagSearchResultProps extends React.ComponentProps<"button"> {
    children: any
    big?: boolean
}

function TagSearchResult({ children, big, ...props }: TagSearchResultProps) {
    return (
        <button
            className={cn(
                "rounded-full px-4 py-1 bg-slate-100 hover:bg-violet-200 font-bold transition-colors",
                big ? "col-span-2 text-sm" : "text-xs",
            )}
            {...props}
        >
            {children}
        </button>
    )
}