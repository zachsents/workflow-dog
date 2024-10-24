import { Anchor as PopoverAnchor } from "@radix-ui/react-popover"
import useMergedRef from "@react-hook/merged-ref"
import useResizeObserver from "@react-hook/resize-observer"
import { useDebouncedCallback, useLocalStorageValue, useRerender } from "@react-hookz/web"
import { IconActivity, IconArrowLeftSquare, IconArrowRightSquare, IconArrowsSplit2, IconBook, IconChevronDown, IconClipboard, IconConfetti, IconConfettiOff, IconCopy, IconExternalLink, IconPalette, IconPaletteOff, IconPin, IconPinnedOff, IconScissors, IconTrash, IconX } from "@tabler/icons-react"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@ui/command"
import Kbd from "@web/components/kbd"
import SearchInput from "@web/components/search-input"
import SimpleTooltip from "@web/components/simple-tooltip"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover"
import { Separator } from "@web/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import VerticalDivider from "@web/components/vertical-divider"
import { useBooleanState, useDialogState, useKeyState, useMotionValueState, useOnceEffect } from "@web/lib/hooks"
import { cn } from "@web/lib/utils"
import { createRandomId, IdNamespace } from "core/ids"
import { AnimatePresence, motion, motionValue, useAnimationControls, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue, type PanHandlers, type SpringOptions, type TapHandlers, type Transition } from "framer-motion"
import { produce } from "immer"
import _mapValues from "lodash/mapValues"
import React, { forwardRef, useContext, useEffect, useMemo, useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import type { SetRequired } from "type-fest"
import { ClientNodeDefinitions } from "workflow-packages/client"
import type { ClientNodeDefinition } from "workflow-packages/lib/types"
import { $id } from "workflow-packages/lib/utils"
import { createStore, useStore, type StoreApi } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { plural } from "../grammar"
import { GraphBuilderContext, NodeContext } from "./context"
import { deserializeGraph, getDefinitionPackageName, serializeGraph, shouldBeMotionValue, useNodeDefinitionsSearch } from "./utils"


/**
 * Component used to create a graph builder instance. Ensures that a 
 * GraphBuilderProvider is present in the component tree, but allows
 * for it to be manually placed higher up in the tree.
 */
export function GBRoot({ children, options, ...props }: React.ComponentProps<"div"> & { options: GraphBuilderOptions }) {
    const gbx = useContext(GraphBuilderContext)
    const renderer = <GraphRenderer {...props}>{children}</GraphRenderer>
    return gbx
        ? renderer
        : <GraphBuilderProvider {...options}>{renderer}</GraphBuilderProvider>
}


/**
 * Where rendering actually starts to take place. Going for a more composable
 * format, rather than nesting more rendering logic inside the Viewport.
 */
function GraphRenderer({ children, ...props }: React.ComponentProps<"div">) {

    const gbx = useGraphBuilder()
    const nodes = gbx.useNodes()

    useEffect(() => {
        const ac = new AbortController()
        window.addEventListener("pointermove", e => {
            gbx.state.screenMousePosition.x.set(e.clientX)
            gbx.state.screenMousePosition.y.set(e.clientY)
        }, { signal: ac.signal })
        return () => ac.abort()
    }, [])

    useMonitorGraphHistory()
    const { undo, redo } = useUndoRedo()
    useHotkeys("mod+z", undo, { preventDefault: true })
    useHotkeys("mod+y", redo, { preventDefault: true })

    return (
        <div {...props} className={cn("relative w-full h-full", props.className)}>
            <Viewport>
                {nodes.map(n => {
                    const def = gbx.getNodeDefinition(n.definitionId)
                    return (
                        <NodeContainer key={n.id} node={n}>
                            <def.component />
                        </NodeContainer>
                    )
                })}
            </Viewport>

            {!gbx.options.readonly && <>
                <ContextMenu />
                <SelectionToolbar />
                <ConfigSidepanel />
            </>}

            {children}
        </div>
    )
}

const MAX_ZOOM = 5
const MIN_ZOOM = 0.2

// #region Viewport
/**
 * Handles panning, zooming, etc.
 */
function Viewport({ children }: { children: React.ReactNode }) {

    const gbx = useGraphBuilder()

    const pan = gbx.useStore(s => s.pan)
    const zoom = gbx.useStore(s => s.zoom)

    const tapControls = useTapControls((e) => {
        if (!e.shiftKey && gbx.state.selection.size > 0)
            gbx.store.setState({ selection: new Set<string>() })
    })

    const boxSelection = gbx.useStore(s => s.boxSelection)
    const isBoxSelecting = useKeyState("ctrl") || !!boxSelection

    useHotkeys("backspace, delete", () => {
        if (gbx.options.readonly)
            return
        if (gbx.state.selection.size > 0)
            gbx.deleteNodes(Array.from(gbx.state.selection))
    })

    useHotkeys("ctrl+a", () => {
        if (gbx.options.readonly)
            return
        gbx.store.setState({ selection: new Set(gbx.state.nodes.keys()) })
    }, { preventDefault: true })

    // const [hotslot, setHotslot] = useHotSlot()
    // useHotkeys("z", () => {
    //     if (gbx.options.readonly)
    //         return

    //     if (gbx.state.currentlyHoveredNodeDefId)
    //         setHotslot(gbx.state.currentlyHoveredNodeDefId)
    //     else if (hotslot)
    //         gbx.addNodeAtMouse({ definitionId: hotslot })
    // })
    // useHotkeys("shift+z", () => {
    //     if (gbx.options.readonly)
    //         return
    //     setHotslot(null)
    // })

    useHotkeys("ctrl+v", () => {
        if (gbx.options.readonly)
            return
        gbx.pasteFromClipboard()
    }, { preventDefault: true })

    return (
        <motion.div
            className={cn(
                "relative w-full h-full overflow-hidden touch-none",
            )}
            ref={el => {
                if (gbx.state.viewportElement !== el)
                    gbx.store.setState({ viewportElement: el })
            }}
            onWheel={(e) => {
                const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM,
                    zoom.get() * (1 + e.deltaY * -0.001)
                ))
                const zoomRatio = newZoom / zoom.get()

                const rect = gbx.state.viewportElement!.getBoundingClientRect()
                // only works if transform origin is top left -- if it was center
                // we'd need to calculate the mouse position relative to the center
                const mouseX = e.clientX - rect.x
                const mouseY = e.clientY - rect.y
                // const mouseX = e.clientX - (rect.x + rect.width / 2)
                // const mouseY = e.clientY - (rect.y + rect.height / 2)

                zoom.set(newZoom)
                pan.x.set(mouseX + zoomRatio * (pan.x.get() - mouseX))
                pan.y.set(mouseY + zoomRatio * (pan.y.get() - mouseY))
            }}
        >
            {/* Background / Interaction Box */}
            <motion.div
                className="absolute top-0 left-0 w-full h-full z-0 bg-dots bg-white cursor-grab"
                style={{
                    backgroundPositionX: pan.x,
                    backgroundPositionY: pan.y,
                    backgroundSize: useTransform(() => `${24 * zoom.get()}px ${24 * zoom.get()}px`),
                    ...{ "--dots-color": "var(--color-gray-300)" } as any,
                }}
                animate={{ cursor: isBoxSelecting ? "crosshair" : "grab" }}
                whileTap={{ cursor: isBoxSelecting ? "crosshair" : "grabbing" }}

                onPanStart={(e, info) => {
                    if (!e.ctrlKey || gbx.options.readonly)
                        return

                    const rect = gbx.state.viewportElement!.getBoundingClientRect()
                    gbx.store.setState({
                        boxSelection: {
                            start: {
                                x: motionValue(info.point.x - rect.x),
                                y: motionValue(info.point.y - rect.y),
                            },
                            offset: { x: motionValue(0), y: motionValue(0) },
                        }
                    })
                }}
                onPan={(e, info) => {
                    if (e.ctrlKey || gbx.state.boxSelection) {
                        if (gbx.options.readonly)
                            return

                        const bs = gbx.state.boxSelection
                        if (!bs) return
                        bs.offset.x.set(info.offset.x)
                        bs.offset.y.set(info.offset.y)
                    } else {
                        pan.x.set(pan.x.get() + info.delta.x)
                        pan.y.set(pan.y.get() + info.delta.y)
                    }
                }}
                // For detecting tap's that aren't part of a pan
                onTap={tapControls.registerTap}
                onPanEnd={(e, info) => {
                    if (gbx.state.boxSelection)
                        gbx.store.setState({ boxSelection: null })
                    tapControls.registerPanEnd(e, info)
                }}
                onContextMenu={e => {
                    if (gbx.options.readonly)
                        return

                    e.preventDefault()
                    gbx.store.setState({ contextMenuPosition: { x: e.clientX, y: e.clientY } })
                }}
            />

            {/* Nodes Layer */}
            <motion.div
                className="relative z-10 pointer-events-none origin-top-left"
                style={{ x: pan.x, y: pan.y, scale: zoom }}
            >
                {/* <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[4px] h-[100px] bg-blue-600 rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[4px] bg-red-600 rounded-full pointer-events-none" /> */}

                {children}
            </motion.div>

            {/* Edges Layer */}
            <EdgeRenderer />

            {/* Selection Box */}
            {!gbx.options.readonly && boxSelection &&
                <SelectionBox />}

            {/* Debug */}
            {/* <Debug /> */}
        </motion.div>
    )
}
// #endregion Viewport


// #region MainToolbar
export function MainToolbar() {

    const [search, nodeDefinitionsList] = useNodeDefinitionsSearch()

    const resultsPopover = useDialogState()

    const [pinnedNodes] = usePinnedNodes()
    // const [hotslot] = useHotSlot()

    return (<>
        <Card className="flex items-stretch justify-center gap-1 p-1">
            {/* <SimpleTooltip delay={500} tooltip={<div className="flex flex-col items-stretch gap-2">
                <b className="text-orange-700 flex-center gap-1 font-bold text-center">Hot Slot <TI><IconFlame /></TI></b>
                <p>Press <Kbd>Z</Kbd> over an action to put it in the hot slot.</p>
                <p>Press <Kbd>Z</Kbd> somewhere else to place one of those actions.</p>
                <p>Press <Kbd>Shift+Z</Kbd> to clear the slot.</p>
            </div>}>
                {hotslot
                    ? <DraggableNodeButton
                        definitionId={hotslot} variant="outline"
                        className="gap-2 h-auto shadow-none bg-orange-100 border-orange-300 text-orange-700 text-xs"
                    >
                        <TI><IconFlame /></TI>
                        <Kbd>Z</Kbd>
                    </DraggableNodeButton>
                    : <Button
                        variant="outline"
                        className="gap-2 h-auto shadow-none bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-700"
                    >
                        <p className="text-xs">No action</p>
                        <TI><IconFlame /></TI>
                        <Kbd>Z</Kbd>
                    </Button>}
            </SimpleTooltip>

            <VerticalDivider className="mx-1 -my-1" /> */}

            {pinnedNodes.length > 0 && <>
                <div className="flex-center gap-1 flex-wrap w-max max-w-[600px]">
                    {pinnedNodes.map((nodeDefId, i) =>
                        <DraggableNodeButton
                            key={nodeDefId}
                            definitionId={nodeDefId} variant="outline"
                            className="gap-2 h-auto shadow-none text-xs"
                            hotkey={(i + 1) <= 9 ? `${i + 1}` : undefined}
                        />
                    )}
                </div>

                <VerticalDivider className="mx-1 -my-1" />
            </>}

            <Popover {...resultsPopover.dialogProps}>
                <PopoverAnchor className="shrink-0 w-[300px]">
                    <SearchInput
                        value={search.query} onValueChange={search.setQuery}
                        className="bg-white shadow-none rounded-md w-full"
                        withHotkey noun="action" quantity={nodeDefinitionsList.length}
                        onFocus={resultsPopover.open}
                        onChange={resultsPopover.open}
                    />
                </PopoverAnchor>
                <PopoverContent
                    side="top" sideOffset={12}
                    onOpenAutoFocus={e => e.preventDefault()}
                    onFocusOutside={e => e.preventDefault()}
                    className="flex flex-col-reverse items-stretch p-1"
                >
                    {search.filtered.length > 0
                        ? search.filtered.slice(0, 20).map((result) => {
                            return (
                                <DraggableNodeButton
                                    key={result.id}
                                    definitionId={result.id}
                                    variant="ghost"
                                    className="flex items-center justify-start gap-2 font-normal h-auto py-1 w-full"
                                    tabIndex={-1}
                                    onAdd={() => {
                                        resultsPopover.close();
                                        (document.activeElement as any)?.blur?.()
                                    }}
                                />
                            )
                        })
                        : <p className="text-sm text-muted-foreground text-center py-6">
                            No results found.
                        </p>}
                </PopoverContent>
            </Popover>
        </Card>
    </>)
}


interface DraggableNodeButtonProps {
    definitionId: string
    hotkey?: string
    onAdd?: () => void
    motionProps?: React.ComponentProps<typeof motion.div>
}

const DraggableNodeButton = forwardRef<HTMLDivElement, DraggableNodeButtonProps & React.ComponentProps<typeof Button>>(({
    definitionId,
    hotkey,
    onAdd,
    motionProps = {},
    children,
    ...props
}, ref) => {
    const gbx = useGraphBuilder()
    let def: ClientNodeDefinition | undefined
    try {
        def = gbx.getNodeDefinition(definitionId)
    } catch (err) {
        console.error(err)
    }

    const animationControls = useAnimationControls()

    const contextMenu = useDialogState()
    const [pinnedNodes, addPinnedNode, removePinnedNode] = usePinnedNodes()
    const isPinned = pinnedNodes.includes(definitionId)

    useHotkeys(hotkey ?? "", () => {
        if (hotkey) {
            gbx.addNodeAtMouse({ definitionId })
            onAdd?.()
        }
    })

    if (!def) return <div>No def</div>

    return (
        <DropdownMenu
            open={contextMenu.isOpen}
            onOpenChange={open => {
                if (!open) contextMenu.close()
            }}
        >
            <DropdownMenuTrigger asChild>
                <motion.div
                    {...motionProps}
                    drag dragMomentum={false}
                    animate={animationControls}
                    onDragEnd={(event, info) => {
                        gbx.addNode({
                            definitionId,
                            position: gbx.toGraphPoint(info.point.x, info.point.y, true),
                            _shouldCenterSelf: true,
                        })
                        animationControls.set({ x: 0, y: 0 })
                        motionProps.onDragEnd?.(event, info)
                        onAdd?.()
                    }}
                    onContextMenu={ev => {
                        ev.preventDefault()
                        contextMenu.open()
                    }}
                    ref={ref}
                >
                    <motion.div onTap={() => {
                        gbx.addNodeAtCenter({ definitionId })
                        onAdd?.()
                    }}>
                        <Button {...props}>
                            <TI><def.icon /></TI>
                            <span>{def.name}</span>
                            {children}
                            {hotkey &&
                                <Kbd>{hotkey}</Kbd>}
                        </Button>
                    </motion.div>
                </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
                <DropdownMenuItem
                    className="flex-center gap-2"
                    onSelect={() => isPinned ? removePinnedNode(definitionId) : addPinnedNode(definitionId)}
                >
                    {isPinned ? <>
                        <TI><IconPinnedOff /></TI>
                        <span>Unpin from toolbar</span>
                    </> : <>
                        <TI><IconPin /></TI>
                        <span>Pin to toolbar</span>
                    </>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
// #endregion MainToolbar


// #region ConfigSidepanel
function ConfigSidepanel() {

    const gbx = useGraphBuilder()
    const selection = gbx.useStore(s => s.selection)
    const isSingleNode = selection.size === 1

    const selectedNodeId = Array.from(selection)[0]
    const node = gbx.useStore(s => isSingleNode ? s.nodes.get(selectedNodeId) : undefined)
    const def = node && ClientNodeDefinitions[node.definitionId]

    const packageDisplayName = node && getDefinitionPackageName(node.definitionId)

    const modifiers = gbx.useStore(s => isSingleNode
        ? s.nodes.get(selectedNodeId)?.modifiers
        : undefined)

    const ConfigComponent = useMemo(() => def?.configComponent, [def])
    console.log(selectedNodeId, node, ConfigComponent)

    return (
        <AnimatePresence>
            {(isSingleNode && node && def) ?
                <motion.div
                    className="absolute top-0 right-0 h-full z-[100] pointer-events-none p-4 grid place-items-stretch"
                    key={selectedNodeId}
                >
                    <NodeContext.Provider value={selectedNodeId}>
                        <Card className="pointer-events-auto w-[350px] opacity-80 hover:opacity-100 focus-within:opacity-100 transition-opacity flex-col items-stretch gap-4">
                            <div
                                className={cn(
                                    "font-bold px-4 py-1 mx-1 mt-1 text-center text-white rounded-t-lg rounded-b-sm flex justify-center items-center gap-2 shrink-0",
                                    node.disabled && "opacity-50",
                                )}
                                style={{ backgroundColor: def.color }}
                            >
                                <def.icon />
                                <span className={cn(
                                    node.disabled && "line-through decoration-2",
                                )}>
                                    {def.name}
                                </span>
                                {packageDisplayName &&
                                    <span className="bg-white/30 px-2 py-0.5 rounded-sm ml-3 text-xs font-medium leading-none">
                                        {packageDisplayName}
                                    </span>}
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-scroll grid gap-4 content-start">
                                <p className="text-xs text-muted-foreground px-4">
                                    {def.description}
                                </p>

                                <Separator />

                                <div className="px-4">
                                    <p className="text-xs font-bold mb-2">Modifiers</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                className="gap-2 w-full"
                                                variant="outline" size="sm"
                                            >
                                                {modifiers?.size || "No"} {plural("modifier", modifiers?.size ?? 0)}
                                                <TI><IconChevronDown /></TI>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[300px] z-[110]">
                                            <DropdownMenuItem
                                                className="flex items-center gap-4 no-shrink-children cursor-pointer transition-colors"
                                                onSelect={ev => {
                                                    ev.preventDefault()
                                                    gbx.mutateNodeState(Array.from(selection)[0], n => {
                                                        n.modifiers[modifiers?.has("await") ? "delete" : "add"]("await")
                                                    })
                                                }}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-md text-md flex-center",
                                                    modifiers?.has("await") && "bg-primary text-primary-foreground",
                                                )}>
                                                    <TI><IconActivity /></TI>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <b>Wait For</b>
                                                        {modifiers?.has("await") && <span className="text-muted-foreground text-xs">
                                                            Enabled
                                                        </span>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Makes this action wait for the connected value to emit before running.
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="flex items-center gap-4 no-shrink-children cursor-pointer transition-colors"
                                                onSelect={ev => {
                                                    ev.preventDefault()
                                                    gbx.mutateNodeState(Array.from(selection)[0], n => {
                                                        n.modifiers[modifiers?.has("conditional") ? "delete" : "add"]("conditional")
                                                    })
                                                }}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-md text-md flex-center",
                                                    modifiers?.has("conditional") && "bg-primary text-primary-foreground",
                                                )}>
                                                    <TI><IconArrowsSplit2 /></TI>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <b>Conditional</b>
                                                        {modifiers?.has("conditional") && <span className="text-muted-foreground text-xs">
                                                            Enabled
                                                        </span>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Makes this action only run when the connected condition is true.
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <Separator />

                                <div className="px-4">
                                    <div className="flex flex-col items-stretch gap-4">
                                        {(node && ConfigComponent) ? <ConfigComponent /> : null}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </NodeContext.Provider>
                </motion.div> : null}
        </AnimatePresence>
    )
}
// #endregion ConfigSidepanel


// #region ContextMenu
function ContextMenu() {

    const gbx = useGraphBuilder()
    const position = gbx.useStore(s => s.contextMenuPosition)
    const popoverKey = useMemo(() => Math.random().toString(16).slice(2), [position])

    const [search] = useNodeDefinitionsSearch()

    const closePopover = () => gbx.store.setState({ contextMenuPosition: null })

    const exitTransition: Transition = { duration: 0.1 }

    return (
        <AnimatePresence>
            {!!position && <Popover
                key={popoverKey}
                open onOpenChange={isOpen => void (!isOpen && closePopover())}
            >
                <PopoverAnchor asChild>
                    <motion.div
                        className="fixed z-20 pointer-events-none"
                        style={{ top: position.y, left: position.x }}
                        exit={{ opacity: 0, transition: exitTransition }}
                    >
                        <div className="w-3 h-3 bg-primary rounded-full absolute hack-center" />
                    </motion.div>
                </PopoverAnchor>
                <PopoverContent
                    side="bottom" sideOffset={22} asChild
                    className="w-[300px] p-0 z-20"
                >
                    <motion.div exit={{ opacity: 0, scale: 0.95, transition: exitTransition }}>
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Search actions..."
                                value={search.query}
                                onValueChange={search.setQuery}
                            />
                            <CommandList>
                                {search.filtered.map(result => {
                                    const def = gbx.getNodeDefinition(result.id)
                                    return (
                                        <CommandItem
                                            key={result.id}
                                            value={result.id}
                                            onSelect={() => {
                                                gbx.addNode({
                                                    definitionId: result.id,
                                                    position: gbx.toGraphPoint(position.x, position.y, true),
                                                    _shouldCenterSelf: true,
                                                })
                                                closePopover()
                                            }}
                                            className="flex items-center gap-2 px-4"
                                        >
                                            <div className="text-white p-1 rounded-sm shrink-0" style={{ backgroundColor: def.color }}>
                                                <TI><def.icon /></TI>
                                            </div>
                                            <div className="flex-1">
                                                <p>{def.name}</p>
                                                <p className="text-xs text-muted-foreground">{def.description}</p>
                                            </div>
                                            <SimpleTooltip
                                                tooltip={<div className="flex-center gap-1">
                                                    Learn about this action
                                                    <TI><IconExternalLink /></TI>
                                                </div>}
                                                contentProps={{ side: "right" }}
                                            >
                                                <Button
                                                    className="shrink-0 text-muted-foreground" variant="ghost" size="icon" asChild
                                                    onClick={ev => {
                                                        ev.stopPropagation()
                                                        closePopover()
                                                    }}
                                                >
                                                    <a href={`https://learn.workflow.dog/actions/${def.id}`} target="_blank">
                                                        <TI><IconBook /></TI>
                                                    </a>
                                                </Button>
                                            </SimpleTooltip>
                                        </CommandItem>
                                    )
                                })}
                                <CommandEmpty>No actions found.</CommandEmpty>
                            </CommandList>
                        </Command>
                    </motion.div>
                </PopoverContent>
            </Popover>}
        </AnimatePresence>
    )
}
// endregion ContextMenu


// #region SelectionBox
function SelectionBox() {

    const gbx = useGraphBuilder()
    const bs = gbx.useStore(s => s.boxSelection)!

    const x = useTransform(() => bs.offset.x.get() >= 0 ? bs.start.x.get() : bs.start.x.get() + bs.offset.x.get())
    const y = useTransform(() => bs.offset.y.get() >= 0 ? bs.start.y.get() : bs.start.y.get() + bs.offset.y.get())
    const width = useTransform(() => Math.abs(bs.offset.x.get()))
    const height = useTransform(() => Math.abs(bs.offset.y.get()))

    const handleBoxChange = () => {
        const viewportRect = gbx.state.viewportElement!.getBoundingClientRect()
        const includedNodeIds = Array.from(gbx.state.nodes.values()).filter(node => {
            // TO DO: fix bug here. 
            // node._element is undefined after ctrl+z undoing a deletion then trying to box select
            const nodeRect = node._element!.getBoundingClientRect()
            const nodeCenter = {
                x: nodeRect.x + nodeRect.width / 2 - viewportRect.x,
                y: nodeRect.y + nodeRect.height / 2 - viewportRect.y,
            }

            return nodeCenter.x > x.get()
                && nodeCenter.x < x.get() + width.get()
                && nodeCenter.y > y.get()
                && nodeCenter.y < y.get() + height.get()
        }).map(n => n.id)

        const isSame = includedNodeIds.length === gbx.state.selection.size
            && includedNodeIds.every(id => gbx.state.selection.has(id))

        if (isSame) return

        gbx.store.setState(() => ({
            selection: new Set(includedNodeIds),
        }))
    }

    useMotionValueEvent(x, "change", handleBoxChange)
    useMotionValueEvent(y, "change", handleBoxChange)
    useMotionValueEvent(width, "change", handleBoxChange)
    useMotionValueEvent(height, "change", handleBoxChange)

    return (
        <motion.div
            className="absolute top-0 left-0 z-[11] bg-blue-400/20 cursor-crosshair rounded-md outline outline-blue-400 outline-[1px] pointer-events-none"
            style={{ x, y, width, height }}
        />
    )
}


// #region SelectionToolbar
function SelectionToolbar() {

    const gbx = useGraphBuilder()
    const pan = gbx.useStore(s => s.pan)
    const zoom = gbx.useStore(s => s.zoom)

    const selection = gbx.useStore(s => s.selection)

    const [xs, ys, widths, heights] = useMemo(() => {
        const xs: MotionValue<number>[] = []
        const ys: MotionValue<number>[] = []
        const widths: MotionValue<number>[] = []
        const heights: MotionValue<number>[] = []
        selection.forEach(id => {
            const n = gbx.state.nodes.get(id)
            if (!n) return
            xs.push(n.position.x)
            ys.push(n.position.y)
            widths.push(n._width)
            heights.push(n._height)
        })
        return [xs, ys, widths, heights] as const
    }, [gbx, selection])

    const minX = useTransform(() => Math.min(...xs.map(x => x.get())))
    const minY = useTransform(() => Math.min(...ys.map(y => y.get())))
    const maxX = useTransform(() => Math.max(...xs.map((x, i) => x.get() + widths[i].get())))
    const maxY = useTransform(() => Math.max(...ys.map((y, i) => y.get() + heights[i].get())))

    const boxStyle = {
        x: useTransform(() => minX.get() * zoom.get() + pan.x.get()),
        y: useTransform(() => minY.get() * zoom.get() + pan.y.get()),
        width: useTransform(() => (maxX.get() - minX.get()) * zoom.get()),
        height: useTransform(() => (maxY.get() - minY.get()) * zoom.get()),
    }

    const isWaitingOnWidths = useMotionValueState(useTransform(() => widths.some(w => w.get() === 0)))

    const setHighlightColor = (color: string | null) => void gbx.mutateState(s => {
        s.selection.forEach(id => {
            const n = s.nodes.get(id)
            if (!n) return
            if (color)
                n.highlightColor = color
            else
                delete n.highlightColor
        })
    })

    const allDisabled = gbx.useStore(s => Array.from(s.selection).every(id => s.nodes.get(id)?.disabled))

    const isSingleNode = selection.size === 1
    const modifiers = gbx.useStore(s => isSingleNode
        ? s.nodes.get(Array.from(selection)[0])?.modifiers
        : undefined)

    return (
        <TooltipProvider delayDuration={0}>
            <motion.div
                className={cn(
                    "absolute top-0 left-0 z-[19] rounded-sm pointer-events-none",
                    (selection.size === 0 || isWaitingOnWidths) && "hidden",
                    selection.size > 1 && "outline-dashed outline-1 outline-gray-600 outline-offset-8",
                )}
                style={boxStyle}
            >
                <Card className="flex-center p-1 absolute hack-center-x bottom-full mb-5 pointer-events-auto">
                    <SelectionToolbarButton
                        label="Select Incomers"
                        action={() => {
                            gbx.mutateState(s => {
                                selection.forEach(nid => {
                                    gbx.state.edges.forEach(edge => {
                                        if (edge.t === nid) s.selection.add(edge.s)
                                    })
                                })
                            })
                        }}
                        icon={IconArrowLeftSquare}
                        hotkey="shift+ArrowLeft"
                        shortcut={["\u21e7", "\u2190"]}
                    />
                    <SelectionToolbarButton
                        label="Select Outgoers"
                        action={() => {
                            gbx.mutateState(s => {
                                selection.forEach(nid => {
                                    gbx.state.edges.forEach(edge => {
                                        if (edge.s === nid) s.selection.add(edge.t)
                                    })
                                })
                            })
                        }}
                        icon={IconArrowRightSquare}
                        hotkey="shift+ArrowRight"
                        shortcut={["\u21e7", "\u2192"]}
                    />
                    <VerticalDivider className="mx-1" />
                    <SelectionToolbarButton
                        label={allDisabled ? "Enable" : "Disable"}
                        action={() => {
                            gbx.mutateState(s => {
                                s.selection.forEach(id => {
                                    const n = s.nodes.get(id)
                                    if (!n) return
                                    n.disabled = !allDisabled
                                })
                            })
                        }}
                        icon={allDisabled ? IconConfetti : IconConfettiOff}
                        hotkey="mod+shift+e"
                        shortcut={["\u2318", "\u21e7", "E"]}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <SelectionToolbarButton
                                label="Set Highlight Color"
                                icon={IconPalette}
                            />
                        </PopoverTrigger>
                        <PopoverContent sideOffset={10} className="p-1 flex-center gap-1 *:text-xl w-auto">
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor(null)}
                            >
                                <TI><IconPaletteOff /></TI>
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("red")}
                            >
                                <div className="bg-red-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("orange")}
                            >
                                <div className="bg-orange-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("yellow")}
                            >
                                <div className="bg-yellow-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("green")}
                            >
                                <div className="bg-green-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("cyan")}
                            >
                                <div className="bg-cyan-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("blue")}
                            >
                                <div className="bg-blue-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("violet")}
                            >
                                <div className="bg-violet-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setHighlightColor("pink")}
                            >
                                <div className="bg-pink-500 rounded-full w-[1em] h-[1em]" />
                            </Button>
                        </PopoverContent>
                    </Popover>
                    <VerticalDivider className="mx-1" />
                    <SelectionToolbarButton
                        label="Copy"
                        action={() => gbx.copySelectionToClipboard()}
                        icon={IconClipboard}
                        hotkey="mod+c"
                        shortcut={["\u2318", "C"]}
                    />
                    <SelectionToolbarButton
                        label="Cut"
                        action={() => gbx.copySelectionToClipboard(true)}
                        icon={IconScissors}
                        hotkey="mod+x"
                        shortcut={["\u2318", "X"]}
                    />
                    <SelectionToolbarButton
                        label="Duplicate"
                        action={() => {
                            gbx.pasteFromString(gbx.serializeSelection(), {
                                offset: { x: 60, y: 60 },
                                select: true,
                            })
                        }}
                        icon={IconCopy}
                        hotkey="mod+d"
                        shortcut={["\u2318", "D"]}
                    />
                    <SelectionToolbarButton
                        label="Delete"
                        action={() => void gbx.deleteNodes(Array.from(selection))}
                        icon={IconTrash}
                        shortcut={["Del"]}
                    />
                    {isSingleNode && modifiers && <>
                        <VerticalDivider className="mx-1" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="gap-2 h-auto self-stretch text-muted-foreground"
                                    variant="ghost" size="sm"
                                >
                                    {modifiers?.size || "No"} {plural("modifier", modifiers?.size ?? 0)}
                                    <TI><IconChevronDown /></TI>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[300px] z-[110]">
                                <DropdownMenuItem
                                    className="flex items-center gap-4 no-shrink-children cursor-pointer transition-colors"
                                    onSelect={ev => {
                                        ev.preventDefault()
                                        gbx.mutateNodeState(Array.from(selection)[0], n => {
                                            n.modifiers[modifiers?.has("await") ? "delete" : "add"]("await")
                                        })
                                    }}
                                >
                                    <div className={cn(
                                        "p-2 rounded-md text-md flex-center",
                                        modifiers?.has("await") && "bg-primary text-primary-foreground",
                                    )}>
                                        <TI><IconActivity /></TI>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <b>Wait For</b>
                                            {modifiers?.has("await") && <span className="text-muted-foreground text-xs">
                                                Enabled
                                            </span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Makes this action wait for the connected value to emit before running.
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-4 no-shrink-children cursor-pointer transition-colors"
                                    onSelect={ev => {
                                        ev.preventDefault()
                                        gbx.mutateNodeState(Array.from(selection)[0], n => {
                                            n.modifiers[modifiers?.has("conditional") ? "delete" : "add"]("conditional")
                                        })
                                    }}
                                >
                                    <div className={cn(
                                        "p-2 rounded-md text-md flex-center",
                                        modifiers?.has("conditional") && "bg-primary text-primary-foreground",
                                    )}>
                                        <TI><IconArrowsSplit2 /></TI>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <b>Conditional</b>
                                            {modifiers?.has("conditional") && <span className="text-muted-foreground text-xs">
                                                Enabled
                                            </span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Makes this action only run when the connected condition is true.
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>}
                </Card>
            </motion.div>
        </TooltipProvider>
    )
}

const SelectionToolbarButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button> & {
    icon: React.ComponentType
    label: string
    shortcut?: string[]
    hotkey?: string
    action?: () => void
}>(({ icon: Icon, label, shortcut, hotkey, action, ...props }, ref) => {

    const hasHotkey = useMemo(() => !!hotkey, [])
    if (hasHotkey && action) useHotkeys(hotkey!, action, { preventDefault: true })

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="sm" variant="ghost"
                    {...props}
                    className={cn("text-lg aspect-square h-[2.25em] p-0 flex-center", props.className)}
                    onClick={ev => {
                        action?.()
                        props.onClick?.(ev)
                    }}
                    ref={ref}
                >
                    <TI><Icon /></TI>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex-center gap-2">
                <span>{label}</span>
                {shortcut && <div className="flex-center gap-1">
                    {shortcut.map((key, i) => <Kbd key={i}>{key}</Kbd>)}
                </div>}
            </TooltipContent>
        </Tooltip>
    )
})


// #region NodeContainer
function NodeContainer({ node: n, children }: { node: Node, children: React.ReactNode }) {

    const gbx = useGraphBuilder()
    const [isDragging, startDrag, endDrag] = useBooleanState()

    const tapControls = useTapControls((e) => {
        gbx.store.setState(s => ({
            selection: new Set(
                e.shiftKey
                    ? s.selection.has(n.id)
                        ? [...s.selection].filter(id => id !== n.id)
                        : [...s.selection, n.id]
                    : [n.id]
            ),
        }))
    })

    const resizeRef = useRef<HTMLDivElement>(null)
    useResizeObserver(resizeRef, entry => {
        n._width.set(entry.contentRect.width)
        n._height.set(entry.contentRect.height)
    })

    const ref = useMergedRef(resizeRef, (el) => {
        if (!el) return
        n._width.set(el.offsetWidth)
        n._height.set(el.offsetHeight)

        const updates: Partial<Node> = {}
        if (n._element !== el) updates._element = el
        if (n._shouldCenterSelf) {
            n.position.x.set(n.position.x.get() - el.offsetWidth / 2)
            n.position.y.set(n.position.y.get() - el.offsetHeight / 2)
            updates._shouldCenterSelf = false
        }
        if (Object.keys(updates).length > 0)
            gbx.setNodeState(n.id, updates)
    })

    const isSelected = gbx.useStore(s => s.selection.has(n.id))

    return (
        <NodeContext.Provider value={n.id}>
            <motion.div
                className={cn(
                    "absolute pointer-events-auto",
                    gbx.options.readonly ? "cursor-default"
                        : isDragging ? "cursor-grabbing" : "cursor-pointer",
                    (isSelected || isDragging) ? "z-20" : "z-10",
                )}
                style={{
                    x: n.position.x,
                    y: n.position.y,
                }}
                ref={ref}

                {...!gbx.options.readonly && {
                    onPanStart: startDrag,
                    onPan: (e, info) => {
                        const selection = gbx.state.selection
                        const zoom = gbx.state.zoom.get()
                        if (selection.has(n.id)) {
                            selection.forEach(id => {
                                const node = gbx.state.nodes.get(id)
                                if (!node) return
                                node.position.x.set(node.position.x.get() + info.delta.x / zoom)
                                node.position.y.set(node.position.y.get() + info.delta.y / zoom)
                            })
                        } else {
                            n.position.x.set(n.position.x.get() + info.delta.x / zoom)
                            n.position.y.set(n.position.y.get() + info.delta.y / zoom)
                        }
                    },
                    // For detecting tap's that aren't part of a pan
                    onTap: tapControls.registerTap,
                    onPanEnd: (e, info) => {
                        tapControls.registerPanEnd(e, info)
                        endDrag()
                        gbx.store.setState(s => ({
                            nodes: new Map([
                                ...Array.from(s.nodes.entries()).filter(([id]) => id !== n.id),
                                [n.id, s.nodes.get(n.id)!] as const,
                            ]),
                        }))
                    },
                    onPointerEnter: () => gbx.store.setState({ currentlyHoveredNodeDefId: n.definitionId }),
                    onPointerLeave: () => gbx.store.setState({ currentlyHoveredNodeDefId: null }),
                }}
            >
                {children}
            </motion.div>
        </NodeContext.Provider>
    )
}


// #region EdgeRenderer
function EdgeRenderer() {
    const gbx = useGraphBuilder()

    const zoom = gbx.useStore(s => s.zoom)
    const pan = gbx.useStore(s => s.pan)

    const edges = gbx.useStore(useShallow(
        s => Array.from(s.edges.values())
            .filter(e => {
                const source = s.nodes.get(e.s)
                const target = s.nodes.get(e.t)
                return source?._element && target?._element
            })
    ))

    const connection = gbx.useStore(s => s.connection)

    /*
    There's a bug where the EdgeRenderer doesn't react to the initial
    centering of the viewport. Not sure why this is, as a console.log
    shows the correct value. Could be a Framer Motion bug.
    */
    const rerender = useRerender()
    useOnceEffect(() => {
        rerender()
    })

    return (
        <motion.svg
            className="absolute z-[9] top-0 left-0 w-full h-full pointer-events-none"
        >
            <motion.g x={0} y={0} width={0} height={0} style={{
                x: pan.x,
                y: pan.y,
                scale: zoom,
                originX: "0px",
                originY: "0px",
            }}>
                {edges.map(e => <Edge key={e.id} id={e.id} />)}

                {connection && <ConnectionLine />}
            </motion.g>
        </motion.svg>
    )
}

export function useRegisterHandle(indexingId: string, { type }: {
    type: HandleType
}) {
    const gbx = useGraphBuilder()
    const nodeId = useNodeId()
    const isInput = type === "input"

    // Create setter to put handle position in node state
    const updateInternalHandlePosition = (x: number, y: number) => {
        const hp = gbx.state.nodes.get(nodeId)?._handlePositions
        if (hp?.[indexingId]) {
            hp[indexingId].x.set(x)
            hp[indexingId].y.set(y)
        } else {
            gbx.mutateState(s => {
                const n = s.nodes.get(nodeId)!
                n._handlePositions ??= {}
                n._handlePositions[indexingId] ??= { x: motionValue(x), y: motionValue(y) }
            })
        }
    }

    // connection states
    const isConnectingAtAll = gbx.useStore(s => !!s.connection)
    const isConnectingToUs = gbx.useStore(s =>
        s.connection?.startType === "input"
        && s.connection?.s === nodeId
        && s.connection?.sh === indexingId
        || s.connection?.startType === "output"
        && s.connection?.t === nodeId
        && s.connection?.th === indexingId
    )
    const canConnectToUs = gbx.useStore(() => gbx.canConnectTo(nodeId, indexingId, type))
    const isConnected = gbx.useStore(s => Array.from(s.edges.values()).some(
        e => e[isInput ? "t" : "s"] === nodeId
            && e[isInput ? "th" : "sh"] === indexingId
    ))

    // event handlers
    const onPointerEnter = () => {
        if (!canConnectToUs) return
        gbx.mutateState(s => {
            s.connection![isInput ? "t" : "s"] = nodeId
            s.connection![isInput ? "th" : "sh"] = indexingId
        })
    }

    const onPointerLeave = () => {
        if (!isConnectingToUs) return
        gbx.mutateState(s => {
            delete s.connection![isInput ? "t" : "s"]
            delete s.connection![isInput ? "th" : "sh"]
        })
    }

    const onPointerUp = () => {
        if (!canConnectToUs) return
        const { startType: _, ...newEdge } = gbx.state.connection!
        gbx.addEdge(newEdge as Required<typeof newEdge>)
    }

    const onPointerDownCapture = (ev: React.PointerEvent<HTMLDivElement>) => {
        ev.stopPropagation()

        const inputConnectedEdge = isInput
            ? Array.from(gbx.state.edges.values()).find(e => e.t === nodeId && e.th === indexingId)
            : undefined

        if (inputConnectedEdge) {
            gbx.mutateState(s => {
                s.edges.delete(inputConnectedEdge.id)
                s.connection = {
                    startType: "output",
                    s: inputConnectedEdge.s,
                    sh: inputConnectedEdge.sh,
                }
            })
        } else {
            gbx.store.setState({
                connection: {
                    startType: type,
                    [isInput ? "t" : "s"]: nodeId,
                    [isInput ? "th" : "sh"]: indexingId,
                }
            })
        }

        window.addEventListener("pointerup", () => {
            gbx.store.setState({ connection: null })
        }, { once: true })
    }

    return {
        updateInternalHandlePosition,
        isConnectingAtAll,
        isConnectingToUs,
        canConnectToUs,
        isConnected,
        onPointerEnter,
        onPointerLeave,
        onPointerUp,
        onPointerDownCapture,
    }
}

// #region Edge
function Edge({ id }: { id: string }) {
    const gbx = useGraphBuilder()
    const e = gbx.useStore(s => s.edges.get(id)!)

    const sourcePos = gbx.useStore(s => s.nodes.get(e.s)!.position)
    const sourceHandlePos = gbx.useStore(s => s.nodes.get(e.s)!._handlePositions?.[e.sh])
    const targetPos = gbx.useStore(s => s.nodes.get(e.t)!.position)
    const targetHandlePos = gbx.useStore(s => s.nodes.get(e.t)!._handlePositions?.[e.th])

    const sx = useTransform(() => sourcePos.x.get() + (sourceHandlePos?.x.get() ?? 0))
    const sy = useTransform(() => sourcePos.y.get() + (sourceHandlePos?.y.get() ?? 0))
    const tx = useTransform(() => targetPos.x.get() + (targetHandlePos?.x.get() ?? 0))
    const ty = useTransform(() => targetPos.y.get() + (targetHandlePos?.y.get() ?? 0))

    const { path, mid } = useEdgePath(sx, sy, tx, ty, { spring: false })

    return (
        <g className={cn("group", !gbx.options.readonly && "cursor-pointer")}>
            <g
                style={{ pointerEvents: "stroke" }}
                onClick={(ev) => {
                    if (gbx.options.readonly) return

                    const bothPartOfSelection = gbx.state.selection.has(e.s) && gbx.state.selection.has(e.t)
                    gbx.store.setState(s => ({
                        selection: new Set(
                            ev.shiftKey
                                ? bothPartOfSelection
                                    ? [...s.selection].filter(id => id !== e.s && id !== e.t)
                                    : [...s.selection, e.s, e.t]
                                : [e.s, e.t]
                        ),
                    }))
                }}
            >
                <motion.path
                    className="stroke-white stroke-[6px] fill-none"
                    style={{ strokeLinecap: "round" }}
                    d={path}
                    variants={edgePathDrawAnim}
                    initial="hidden"
                    animate="visible"
                />
                {!gbx.options.readonly && <motion.path
                    className="group-hover:stroke-gray-400/20 stroke-[20px] fill-none"
                    style={{ strokeLinecap: "round" }}
                    d={path}
                    variants={edgePathDrawAnim}
                    initial="hidden"
                    animate="visible"
                />}
                <motion.path
                    className="stroke-gray-400 stroke-[4px] fill-none"
                    style={{ strokeLinecap: "round" }}
                    d={path}
                    variants={edgePathDrawAnim}
                    initial="hidden"
                    animate="visible"
                />
            </g>
            {!gbx.options.readonly && <EdgeLabel mx={mid.x} my={mid.y}>
                <Button
                    size="sm" variant="destructive"
                    className="pointer-events-auto absolute hack-center group-hover:opacity-100 opacity-0 rounded-full h-[20px] aspect-square px-0"
                    onClick={ev => {
                        gbx.deleteEdge(id)
                        ev.stopPropagation()
                    }}
                >
                    <TI><IconX /></TI>
                </Button>
            </EdgeLabel>}
        </g>
    )
}

const edgePathDrawAnim = {
    // hidden: { pathLength: 0, opacity: 0 },
    hidden: { opacity: 0 },
    visible: {
        // pathLength: 1,
        opacity: 1,
        transition: {
            // pathLength: { type: "spring", duration: 1, bounce: 0 },
            opacity: { duration: 0.2 },
        },
    }
}


function ConnectionLine() {

    const gbx = useGraphBuilder()

    const [sourcePos, sourceHandlePos] = gbx.useStore(useShallow(s => {
        if (!s.connection?.s || !s.connection?.sh) return []
        const node = s.nodes.get(s.connection.s)!
        return [node.position, node._handlePositions?.[s.connection.sh]] as const
    }))

    const [targetPos, targetHandlePos] = gbx.useStore(useShallow(s => {
        if (!s.connection?.t || !s.connection?.th) return []
        const node = s.nodes.get(s.connection.t)!
        return [node.position, node._handlePositions?.[s.connection.th]] as const
    }))

    const [mouse, isMouseReady] = gbx.usePointerPosition()

    const sx = useTransform(() => sourcePos
        ? sourcePos.x.get() + (sourceHandlePos?.x.get() ?? 0)
        : mouse.x.get())
    const sy = useTransform(() => sourcePos
        ? sourcePos.y.get() + (sourceHandlePos?.y.get() ?? 0)
        : mouse.y.get())
    const tx = useTransform(() => targetPos
        ? targetPos.x.get() + (targetHandlePos?.x.get() ?? 0)
        : mouse.x.get())
    const ty = useTransform(() => targetPos
        ? targetPos.y.get() + (targetHandlePos?.y.get() ?? 0)
        : mouse.y.get())

    const { path } = useEdgePath(sx, sy, tx, ty, { spring: false })

    return (
        <g className="pointer-events-none">
            {isMouseReady && <motion.path
                className="stroke-gray-400 stroke-[3px] fill-none"
                style={{
                    strokeLinecap: "round",
                    strokeDasharray: "4 8",
                }}
                d={path}
            />}
        </g>
    )
}


export function useNodeId() {
    return useContext(NodeContext)!
}

export function useNode() {
    const id = useNodeId()
    const gbx = useGraphBuilder()
    return gbx.useStore(s => s.nodes.get(id))!
}


function useTapControls(callback: NonNullable<TapHandlers["onTap"]>): {
    registerPanEnd: NonNullable<PanHandlers["onPanEnd"]>
    registerTap: NonNullable<TapHandlers["onTap"]>
} {
    const panTriggered = useRef<boolean>(false)
    return {
        registerPanEnd: () => {
            panTriggered.current = true
        },
        registerTap: (e, info) => void setTimeout(() => {
            if (!panTriggered.current)
                callback(e, info)
            panTriggered.current = false
        }),
    }
}


// @ts-ignore
function Debug() {

    const gbx = useGraphBuilder()
    const panX = useMotionValueState(gbx.useStore(s => s.pan.x))
    const panY = useMotionValueState(gbx.useStore(s => s.pan.y))
    const zoom = useMotionValueState(gbx.useStore(s => s.zoom))

    return (
        <Card className="absolute z-[60] top-4 right-4 p-2 select-none bg-white/75 text-sm">
            <div className="grid grid-cols-3 gap-2">
                <span>Zoom:</span>
                <span className="font-mono text-right col-span-2">{zoom.toFixed(2)}</span>
                <span>Pan:</span>
                <span className="font-mono text-right">{panX.toFixed(1)},</span>
                <span className="font-mono text-right">{panY.toFixed(1)}</span>
            </div>
        </Card>
    )
}


/**
 * Provides a GraphBuilder instance to the component tree. If GBRoot is
 * used singularly, this provider will be automatically created. If you
 * need access to the GraphBuilder instance higher up in the tree, you
 * can manually place this provider.
 */
function GraphBuilderProvider({ children, ...opts }: { children: React.ReactNode } & GraphBuilderOptions) {
    const gbRef = useRef<GraphBuilder | null>(null)
    if (!gbRef.current)
        gbRef.current = new GraphBuilder(opts)
    return (
        <GraphBuilderContext.Provider value={gbRef.current}>
            {children}
        </GraphBuilderContext.Provider>
    )
}

export function useGraphBuilder() {
    const gbx = useContext(GraphBuilderContext)!
    if (!gbx)
        throw new Error("useGraphBuilder must be used within a GraphBuilderProvider.")
    return gbx
}

export interface GraphBuilderOptions {
    nodeDefinitions: Record<string, NodeDefinition>
    initialGraph?: string
    onGraphChange?: (serializedGraph: string) => void
    readonly?: boolean
    runOutputs?: Record<string, Record<string, string>>
    runErrors?: Record<string, string>
}

export class GraphBuilder {

    public store: StoreApi<GraphBuilderStoreState>

    constructor(public options: GraphBuilderOptions) {
        let initialNodes: GraphBuilderStoreState["nodes"] = new Map()
        let initialEdges: GraphBuilderStoreState["edges"] = new Map()

        if (options.initialGraph) {
            const { nodes, edges } = deserializeGraph(options.initialGraph ?? "")
            initialNodes = new Map(nodes.map(n => [n.id, n]))
            initialEdges = new Map(edges.map(e => [e.id, e]))
        }

        this.store = createStore<GraphBuilderStoreState>(() => ({
            nodes: initialNodes,
            edges: initialEdges,

            selection: new Set(),

            viewportElement: null,
            pan: { x: motionValue(0), y: motionValue(0) },
            zoom: motionValue(1),

            boxSelection: null,
            connection: null,

            screenMousePosition: { x: motionValue(0), y: motionValue(0) },
            currentlyHoveredNodeDefId: null,

            contextMenuPosition: null,

            history: {
                undoStack: [],
                redoStack: [],
                current: null,
            },
        }))

        if (initialNodes.size === 0)
            return

        const unsubscribe = this.store.subscribe((state) => {
            if (!state.viewportElement) return
            unsubscribe()

            const PADDING = 100
            const viewportRect = state.viewportElement.getBoundingClientRect()
            const targetRect = {
                width: viewportRect.width - PADDING * 2,
                height: viewportRect.height - PADDING * 2,
            }
            const targetAspectRatio = targetRect.width / targetRect.height

            const nodesArr = Array.from(state.nodes.values())
            const minX = Math.min(...nodesArr.map(n => n.position.x.get()))
            const minY = Math.min(...nodesArr.map(n => n.position.y.get()))
            const maxX = Math.max(...nodesArr.map(n => n.position.x.get() + n._width.get()))
            const maxY = Math.max(...nodesArr.map(n => n.position.y.get() + n._height.get()))

            const nodeBoxAspectRatio = (maxX - minX) / (maxY - minY)
            const initialZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM,
                nodeBoxAspectRatio > targetAspectRatio
                    ? targetRect.width / (maxX - minX)
                    : targetRect.height / (maxY - minY)
            ))
            const initialPanX = -initialZoom * (maxX + minX) / 2 + viewportRect.width / 2
            const initialPanY = -initialZoom * (maxY + minY) / 2 + viewportRect.height / 2

            if (!isNaN(initialPanX)) this.state.pan.x.set(initialPanX)
            if (!isNaN(initialPanY)) this.state.pan.y.set(initialPanY)
            if (!isNaN(initialZoom)) this.state.zoom.set(initialZoom)
        })
    }

    get state() {
        return this.store.getState()
    }

    get graphMousePosition() {
        return this.toGraphPoint(this.state.screenMousePosition.x.get(), this.state.screenMousePosition.y.get(), true)
    }

    mutateState(recipe: (state: GraphBuilderStoreState) => void) {
        this.store.setState(produce(recipe))
    }

    useStore<T extends unknown>(selector: (state: GraphBuilderStoreState) => T) {
        return useStore(this.store, selector)
    }

    useNodes() {
        return this.useStore(useShallow(s => Array.from(s.nodes.values())))
    }

    addNode(nodeData: Parameters<typeof createNode>[0]) {
        const newNode = createNode(nodeData)
        this.mutateState(s => {
            s.nodes.set(newNode.id, newNode)
        })
        return newNode
    }

    addNodeAtCenter(node: Omit<Parameters<typeof GraphBuilder.prototype["addNode"]>[0], "position">) {
        const rect = this.state.viewportElement!.getBoundingClientRect()
        const center = this.toGraphPoint(rect.width / 2, rect.height / 2, false)
        return this.addNode({
            ...node,
            position: center,
            _shouldCenterSelf: true,
        })
    }

    addNodeAtMouse(node: Omit<Parameters<typeof GraphBuilder.prototype["addNode"]>[0], "position">) {
        return this.addNode({
            ...node,
            position: this.graphMousePosition,
            _shouldCenterSelf: true,
        })
    }

    deleteNode(id: string) {
        this.mutateState(s => {
            s.nodes.delete(id)
            s.edges.forEach(e => {
                if (e.s === id || e.t === id)
                    s.edges.delete(e.id)
            })
            s.selection.delete(id)
        })
    }

    deleteNodes(ids: string[]) {
        this.mutateState(s => {
            ids.forEach(id => {
                s.nodes.delete(id)
                s.selection.delete(id)
            })
            s.edges.forEach(e => {
                if (ids.includes(e.s) || ids.includes(e.t))
                    s.edges.delete(e.id)
            })
        })
    }

    addEdge(edgeData: Omit<Edge, "id">) {
        const id = createEdgeId(edgeData.s, edgeData.sh, edgeData.t, edgeData.th)
        if (this.state.edges.has(id))
            return false

        const newEdge: Edge = {
            id,
            ...edgeData,
        }
        this.store.setState(s => ({
            edges: new Map([...s.edges, [newEdge.id, newEdge]]),
        }))
        return true
    }

    deleteEdge(id: string) {
        this.mutateState(s => {
            s.edges.delete(id)
        })
    }

    setNodeState(id: string, data: Partial<Node>) {
        if (!this.state.nodes.has(id))
            throw new Error(`Node with ID ${id} does not exist.`)
        this.store.setState(s => ({
            nodes: new Map([...s.nodes, [id, {
                ...s.nodes.get(id)!,
                ...data,
            }] as const]),
        }))
    }

    mutateNodeState(id: string, recipe: (node: Node) => void) {
        if (!this.state.nodes.has(id))
            throw new Error(`Node with ID ${id} does not exist.`)
        this.mutateState(s => void recipe(s.nodes.get(id)!))
    }

    useNodeState<T>(id: string, selector: (node: Node) => T) {
        return this.useStore(s => {
            const n = s.nodes.get(id)
            if (!n) throw new Error(`Node with ID ${id} does not exist.`)
            return selector(n)
        })
    }

    getNodeDefinition(definitionId: string) {
        let def = this.options.nodeDefinitions[definitionId]

        if (!def) {
            def = this.options.nodeDefinitions[`node:${definitionId}`]
            if (def) console.warn(`Found node definition using old format ("${definitionId}"). Please update your code to use the new format ("node:${definitionId}").`)
        }

        if (!def) throw new Error(`Node definition not found: ${definitionId}`)
        return def
    }

    getNodeDefinitionForNode(nodeId: string) {
        if (!this.state.nodes.has(nodeId))
            throw new Error(`Node with ID ${nodeId} does not exist.`)
        return this.options.nodeDefinitions[this.state.nodes.get(nodeId)!.definitionId]
    }

    canConnectTo(nodeId: string, handleId: string, type: HandleType) {
        const conn = this.state.connection
        if (!conn) return false

        // ensure correct type (input/output)
        if (conn.startType === type) return false

        // no self-connections
        if (conn.startType === "input" && conn.t === nodeId) return false
        if (conn.startType === "output" && conn.s === nodeId) return false

        // one connection per input
        const edges = Array.from(this.state.edges.values())
        if (type === "input" && edges.some(e => e.t === nodeId && e.th === handleId))
            return false
        if (type === "output" && edges.some(e => e.t === conn.t && e.th === conn.th))
            return false

        // todo: checking value types
        // bc types are defined as component props, we don't have direct access
        // to them. however, we can pass the type in the connection object and
        // in the useRegisterHandle hook, we can check if the types match.
        // just requires a bit of changing types around, and i'm tired.

        return true
    }

    toGraphPoint(x: number, y: number, accountForViewportPosition = false) {
        if (accountForViewportPosition) {
            const rect = this.state.viewportElement!.getBoundingClientRect()
            x -= rect.x
            y -= rect.y
        }
        return {
            x: (x - this.state.pan.x.get()) / this.state.zoom.get(),
            y: (y - this.state.pan.y.get()) / this.state.zoom.get(),
        }
    }

    toScreenPoint(x: number, y: number, accountForViewportPosition = false) {
        const p = {
            x: x * this.state.zoom.get() + this.state.pan.x.get(),
            y: y * this.state.zoom.get() + this.state.pan.y.get(),
        }
        if (accountForViewportPosition) {
            const rect = this.state.viewportElement!.getBoundingClientRect()
            p.x += rect.x
            p.y += rect.y
        }
        return p
    }

    usePointerPosition() {
        const mx = useMotionValue(NaN)
        const my = useMotionValue(NaN)
        const [ready, setReady] = useBooleanState()
        const onPointerMove = (e: PointerEvent) => {
            const viewportRect = this.state.viewportElement!.getBoundingClientRect()
            const p = this.state.pan
            const z = this.state.zoom.get()
            mx.set((e.clientX - viewportRect.x - p.x.get()) / z)
            my.set((e.clientY - viewportRect.y - p.y.get()) / z)
            setReady()
        }
        useEffect(() => {
            window.addEventListener("pointermove", onPointerMove)
            return () => window.removeEventListener("pointermove", onPointerMove)
        }, [mx, my])
        return [{ x: mx, y: my }, ready] as const
    }

    serializeSelection() {
        const nodes = Array.from(this.state.selection)
            .map(id => this.state.nodes.get(id)).filter(n => !!n)

        const edges = Array.from(this.state.edges.values())
            .filter(e => this.state.selection.has(e.s) && this.state.selection.has(e.t))

        const center = {
            x: (Math.min(...nodes.map(n => n.position.x.get()))
                + Math.max(...nodes.map(n => n.position.x.get() + n._width.get()))) / 2,
            y: (Math.min(...nodes.map(n => n.position.y.get()))
                + Math.max(...nodes.map(n => n.position.y.get() + n._height.get()))) / 2,
        }

        return serializeGraph({ nodes, edges, center })
    }

    copySelectionToClipboard(cut = false) {
        if (this.state.selection.size === 0)
            return

        const content = this.serializeSelection()
        localStorage.setItem("workflow-clipboard", content)
        // console.debug("Copied to clipboard:", content)
        toast.success("Copied to clipboard!")

        if (cut)
            this.deleteNodes(Array.from(this.state.selection))
    }

    pasteFromString(content: string, { position, offset: passedOffset, select }: {
        position?: { x: number, y: number }
        offset?: { x: number, y: number }
        select?: boolean
    } = {}) {
        const { nodes: nodesData, edges, center } = deserializeGraph(content) as ReturnType<typeof deserializeGraph> & { center: { x: number, y: number } }
        const offset = position ? {
            x: position.x - center.x,
            y: position.y - center.y,
        } : passedOffset ?? { x: 0, y: 0 }

        const nodeIdMap = new Map<string, string>()
        const nodes = nodesData.map(({ id: oldId, ...n }) => {
            const newNode = createNode({
                ...n,
                position: {
                    x: n.position.x.get() + offset.x,
                    y: n.position.y.get() + offset.y,
                },
            })
            nodeIdMap.set(oldId, newNode.id)
            return newNode
        })
        edges.forEach(e => {
            e.s = nodeIdMap.get(e.s) ?? e.s
            e.t = nodeIdMap.get(e.t) ?? e.t
            e.id = createEdgeId(e.s, e.sh, e.t, e.th)
        })

        this.mutateState(s => {
            nodes.forEach(n => s.nodes.set(n.id, n))
            edges.forEach(e => s.edges.set(e.id, e))
            if (select)
                s.selection = new Set(nodes.map(n => n.id))
        })
    }

    pasteFromClipboard() {
        const content = localStorage.getItem("workflow-clipboard")
        if (!content) return
        this.pasteFromString(content, { position: this.graphMousePosition })
    }
}

// #region Store State
export type GraphBuilderStoreState = {
    nodes: Map<string, Node>
    edges: Map<string, Edge>

    selection: Set<string>

    viewportElement: HTMLDivElement | null
    pan: CoordPair<MotionValue<number>>
    zoom: MotionValue<number>

    boxSelection: null | {
        start: CoordPair<MotionValue<number>>
        offset: CoordPair<MotionValue<number>>
    }

    connection: null | Connection

    screenMousePosition: CoordPair<MotionValue<number>>
    currentlyHoveredNodeDefId: string | null

    contextMenuPosition: { x: number, y: number } | null

    history: {
        undoStack: string[]
        redoStack: string[]
        current: string | null
    }
}


/**
 * Properties prefixed with underscores are considered private and 
 * will not be serialized when saving the graph state.
 */
export type Node<TNum = MotionValue<number>> = {
    id: string

    position: CoordPair<TNum>
    _element?: HTMLElement
    _width: TNum
    _height: TNum
    _handlePositions?: Record<string, CoordPair<TNum>>

    definitionId: string
    handleStates: Record<string, HandleState>
    modifiers: Set<string>

    config: Record<string, any>
    highlightColor?: string
    disabled?: boolean

    _shouldCenterSelf?: boolean
}

export function createNode(
    data: SetRequired<Partial<Node<number | MotionValue<number>>>, "definitionId">
): Node {
    const { id, position, _width, _height, _handlePositions, ...rest } = data
    return {
        handleStates: {},
        config: {},
        modifiers: new Set(),
        ...rest,
        id: id ?? createRandomId(IdNamespace.ActionNode),
        position: {
            x: shouldBeMotionValue(position?.x ?? 0),
            y: shouldBeMotionValue(position?.y ?? 0),
        },
        _width: shouldBeMotionValue(_width ?? 0),
        _height: shouldBeMotionValue(_height ?? 0),
        _handlePositions: _mapValues(_handlePositions ?? {}, pos => ({
            x: shouldBeMotionValue(pos.x),
            y: shouldBeMotionValue(pos.y),
        })),
    }
}


export type Edge = {
    id: string
    /** Source node ID */
    s: string
    /** Source handle ID */
    sh: string
    /** Target node ID */
    t: string
    /** Target handle ID */
    th: string
}

export type Connection = {
    s?: string
    sh?: string
    t?: string
    th?: string
    startType: HandleType
}

export type CoordPair<T> = {
    x: T
    y: T
}

export type MotionCoordPair = {
    x: MotionValue<number>
    y: MotionValue<number>
}

function createEdgeId(source: string, sourceHandle: string, target: string, targetHandle: string) {
    return `${IdNamespace.Edge}:${source}_${sourceHandle}--${target}_${targetHandle}`
}

export type NodeDefinition = ClientNodeDefinition

export type HandleState = {
    listMode: ListHandleMode
    multi?: {
        amount: number
        names?: string[]
    }
}

export type HandleType = "input" | "output"
export type ListHandleMode = "multi" | "single"

function useEdgePath(
    sx: MotionValue<number>, sy: MotionValue<number>,
    tx: MotionValue<number>, ty: MotionValue<number>,
    {
        spring,
        springAnimation = { stiffness: 1000, damping: 75, mass: 1 },
    }: {
        spring?: boolean
        springAnimation?: SpringOptions
    } = {}
) {
    const midX = useTransform(() => (sx.get() + tx.get()) / 2)
    const midY = useTransform(() => (sy.get() + ty.get()) / 2)

    const quarterXDistance = useTransform(() => (midX.get() - sx.get()) / 2)
    const controlX = useTransform(() => sx.get() + Math.abs(quarterXDistance.get()))
    const controlY = useTransform(() => quarterXDistance.get() < 0
        ? sy.get() + Math.max(Math.min(midY.get() - sy.get(), 50), -50)
        : sy.get())

    // const springAnim = { duration: 300, bounce: 0.25 }
    const path = spring
        ? useMotionTemplate`M ${sx} ${sy} Q ${controlX} ${controlY} ${useSpring(midX, springAnimation)} ${useSpring(midY, springAnimation)} T ${tx} ${ty}`
        : useMotionTemplate`M ${sx} ${sy} Q ${controlX} ${controlY} ${midX} ${midY} T ${tx} ${ty}`

    return {
        path,
        mid: { x: midX, y: midY },
    }
}


function EdgeLabel({
    children,
    mx, my,
    foreignObjectSize = 100
}: {
    children: React.ReactNode
    mx: MotionValue<number>
    my: MotionValue<number>
    foreignObjectSize?: number
}) {
    const foreignObjectX = useTransform(() => mx.get() - foreignObjectSize / 2)
    const foreignObjectY = useTransform(() => my.get() - foreignObjectSize / 2)

    return (
        <motion.foreignObject
            x={foreignObjectX} y={foreignObjectY}
            width={foreignObjectSize} height={foreignObjectSize}
            className="relative"
        >
            {children}
        </motion.foreignObject>
    )
}


function usePinnedNodes() {
    const pinnedNodes = useLocalStorageValue("graph-builder-pinned-nodes", {
        defaultValue: [$id.node("primitives/text"), $id.node("primitives/number")],
        initializeWithValue: true,
    })
    const addPinnedNode = (defId: string) => pinnedNodes.set(Array.from(new Set([...pinnedNodes.value, defId])))
    const removePinnedNode = (defId: string) => pinnedNodes.set(pinnedNodes.value.filter(id => id !== defId))
    return [pinnedNodes.value, addPinnedNode, removePinnedNode] as const
}

function useHotSlot() {
    const hotSlot = useLocalStorageValue("graph-builder-hot-slot", {
        defaultValue: "",
        initializeWithValue: true,
    })
    const setHotSlot = (slot: string | null) => hotSlot.set(slot ?? "")
    return [hotSlot.value || null, setHotSlot] as const
}


function useMonitorGraphHistory() {
    const gbx = useGraphBuilder()
    const history = gbx.useStore(s => s.history)
    const serialize = (state: GraphBuilderStoreState) => serializeGraph({
        nodes: Array.from(state.nodes.values()),
        edges: Array.from(state.edges.values()),
    })

    useEffect(() => {
        gbx.mutateState(s => {
            s.history.current = serialize(s)
        })
    }, [])

    const update = () => {
        const serializedUpdate = serialize(gbx.state)
        if (!history.current || serializedUpdate === history.current) return
        gbx.store.setState({
            history: {
                undoStack: [...history.undoStack, history.current].slice(-20),
                redoStack: [],
                current: serializedUpdate,
            }
        })
        gbx.options.onGraphChange?.(serializedUpdate)
    }

    const fastUpdate = useDebouncedCallback(update, [gbx, history], 25)
    const slowUpdate = useDebouncedCallback(update, [gbx, history], 200)

    useEffect(() => gbx.store.subscribe((state, prev) => {
        if (state.nodes.size !== prev.nodes.size || state.edges.size !== prev.edges.size)
            fastUpdate()
        else
            slowUpdate()
    }), [gbx.store, slowUpdate, fastUpdate])

    const positionValues = gbx.useStore(useShallow(s => {
        return Array.from(s.nodes.values()).flatMap(n => [n.position.x, n.position.y])
    }))

    useEffect(() => {
        const unsubs = positionValues.map(v => v.on("change", () => slowUpdate()))
        return () => unsubs.forEach(u => u())
    }, [positionValues, slowUpdate])
}


function useUndoRedo() {
    const gbx = useGraphBuilder()
    const history = gbx.useStore(s => s.history)

    const serialize = () => serializeGraph({
        nodes: Array.from(gbx.state.nodes.values()),
        edges: Array.from(gbx.state.edges.values()),
    })

    function undo() {
        if (history.undoStack.length === 0)
            return

        const last = history.undoStack.at(-1)!
        const fromHistory = deserializeGraph(last)
        gbx.store.setState({
            history: {
                undoStack: history.undoStack.slice(0, -1),
                redoStack: [...history.redoStack, serialize()],
                current: last,
            },
            nodes: new Map(fromHistory.nodes.map(n => [n.id, n])),
            edges: new Map(fromHistory.edges.map(e => [e.id, e])),
        })
        gbx.options.onGraphChange?.(last)
    }

    function redo() {
        if (history.redoStack.length === 0)
            return

        const last = history.redoStack.at(-1)!
        const fromHistory = deserializeGraph(last)
        gbx.store.setState({
            history: {
                undoStack: [...history.undoStack, serialize()],
                redoStack: history.redoStack.slice(0, -1),
                current: last,
            },
            nodes: new Map(fromHistory.nodes.map(n => [n.id, n])),
            edges: new Map(fromHistory.edges.map(e => [e.id, e])),
        })
        gbx.options.onGraphChange?.(last)
    }

    return { undo, redo }
}