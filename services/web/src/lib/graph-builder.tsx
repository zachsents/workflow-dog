import { Anchor as PopoverAnchor } from "@radix-ui/react-popover"
import { useLocalStorageValue } from "@react-hookz/web"
import { IconFlame, IconPin, IconPinnedOff, IconX } from "@tabler/icons-react"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@ui/command"
import Kbd from "@web/components/kbd"
import SearchInput from "@web/components/search-input"
import SimpleTooltip from "@web/components/simple-tooltip"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Popover, PopoverContent } from "@web/components/ui/popover"
import VerticalDivider from "@web/components/vertical-divider"
import { useBooleanState, useDialogState, useKeyState, useMotionValueState, useSearch } from "@web/lib/hooks"
import { cn } from "@web/lib/utils"
import { createRandomId, IdNamespace } from "core/ids"
import { AnimatePresence, motion, motionValue, type MotionValue, type PanHandlers, type SpringOptions, type TapHandlers, type Transition, useAnimationControls, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion"
import { produce } from "immer"
import React, { forwardRef, useContext, useEffect, useMemo, useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import ClientNodeDefinitions from "workflow-packages/client-nodes"
import type { ClientNodeDefinition } from "workflow-packages/helpers/react"
import { createStore, useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { GraphBuilderContext, NodeContext } from "./graph-builder-ctx"


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
            <div className="absolute hack-center-x bottom-4 px-4 max-w-full">
                <MainToolbar />
            </div>
            <ContextMenu />

            {children}
        </div>
    )
}


/**
 * Handles panning, zooming, etc.
 */
// #region Viewport
function Viewport({ children }: { children: React.ReactNode }) {

    const gbx = useGraphBuilder()

    const pan = gbx.useStore(s => s.pan)
    const zoom = gbx.useStore(s => s.zoom)

    const tapControls = useTapControls((e) => {
        if (!e.shiftKey)
            gbx.store.setState({ selection: new Set<string>() })
    })

    const boxSelection = gbx.useStore(s => s.boxSelection)
    const isBoxSelecting = useKeyState("ctrl") || !!boxSelection

    useHotkeys("backspace, delete", () => {
        if (gbx.state.selection.size > 0)
            gbx.deleteNodes(Array.from(gbx.state.selection))
    })

    useHotkeys("ctrl+a", () => {
        gbx.store.setState({ selection: new Set(gbx.state.nodes.keys()) })
    })

    const [hotslot, setHotslot] = useHotSlot()
    useHotkeys("z", () => {
        if (gbx.state.currentlyHoveredNodeDefId)
            setHotslot(gbx.state.currentlyHoveredNodeDefId)
        else if (hotslot)
            gbx.addNodeAtMouse({ definitionId: hotslot })
    })
    useHotkeys("shift+z", () => setHotslot(null))

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
                const newZoom = Math.min(5, Math.max(0.2,
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
                className="absolute top-0 left-0 w-full h-full z-0 bg-dots bg-gray-300 cursor-grab"
                style={{
                    backgroundPositionX: pan.x,
                    backgroundPositionY: pan.y,
                    // backgroundPositionX: useMotionTemplate`calc(50% + ${pan.x}px)`,
                    // backgroundPositionY: useMotionTemplate`calc(50% + ${pan.y}px)`,
                    backgroundSize: useTransform(() => `${24 * zoom.get()}px ${24 * zoom.get()}px`),
                }}
                animate={{ cursor: isBoxSelecting ? "crosshair" : "grab" }}
                whileTap={{ cursor: isBoxSelecting ? "crosshair" : "grabbing" }}

                onPanStart={(e, info) => {
                    if (!e.ctrlKey) return
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
                    gbx.store.setState({ boxSelection: null })
                    tapControls.registerPanEnd(e, info)
                }}
                onContextMenu={e => {
                    e.preventDefault()
                    gbx.store.setState({ contextMenuPosition: { x: e.clientX, y: e.clientY } })
                }}
            />

            {/* Nodes Layer */}
            <motion.div
                className="relative z-10 pointer-events-none origin-top-left"
                style={{ x: pan.x, y: pan.y, scale: zoom }}
            >
                {children}
            </motion.div>

            {/* Edges Layer */}
            <EdgeRenderer />

            {/* Selection Box */}
            {boxSelection &&
                <SelectionBox />}

            {/* Debug */}
            <Debug />
        </motion.div>
    )
}
// #endregion Viewport


const nodeDefinitionsList = Object.entries(ClientNodeDefinitions).map(([id, def]) => ({
    id,
    name: def.name,
    package: getDefinitionPackageName(id),
}))

// #region MainToolbar
function MainToolbar() {

    const resultsPopover = useDialogState()

    const search = useSearch(nodeDefinitionsList, {
        keys: ["name", "package"],
        threshold: 0.4,
    })

    const [pinnedNodes] = usePinnedNodes()
    const [hotslot] = useHotSlot()

    return (<>
        <Card className="flex items-stretch justify-center gap-1 p-1">
            <SimpleTooltip delay={500} tooltip={<div className="flex flex-col items-stretch gap-2">
                <b className="text-orange-700 flex-center gap-1 font-bold text-center">Hot Slot <TI><IconFlame /></TI></b>
                <p>Press <Kbd>Z</Kbd> over an action to put it in the hot slot.</p>
                <p>Press <Kbd>Z</Kbd> somewhere else to place one of those actions.</p>
                <p>Press <Kbd>Shift+Z</Kbd> to clear the slot.</p>
            </div>}>
                {hotslot
                    ? <DraggableNodeButton
                        definitionId={hotslot} variant="outline"
                        className="flex-center gap-2 h-auto shadow-none bg-orange-100 border-orange-300 text-orange-700 text-xs"
                    >
                        <TI><IconFlame /></TI>
                        <Kbd>Z</Kbd>
                    </DraggableNodeButton>
                    : <Button
                        variant="outline"
                        className="flex-center gap-2 h-auto shadow-none bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-700"
                    >
                        <p className="text-xs">No action</p>
                        <TI><IconFlame /></TI>
                        <Kbd>Z</Kbd>
                    </Button>}
            </SimpleTooltip>

            <VerticalDivider className="mx-1 -my-1" />

            <div className="flex-center gap-1 flex-wrap w-max max-w-[600px]">
                {pinnedNodes.map((nodeDefId, i) =>
                    <DraggableNodeButton
                        key={nodeDefId}
                        definitionId={nodeDefId} variant="outline"
                        className="flex-center gap-2 h-auto shadow-none text-xs"
                        hotkey={i < 9 ? `${i + 1}` : undefined}
                    />
                )}
            </div>

            <VerticalDivider className="mx-1 -my-1" />

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
    const def = gbx.getNodeDefinition(definitionId)

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


// #region ContextMenu
function ContextMenu() {

    const gbx = useGraphBuilder()
    const position = gbx.useStore(s => s.contextMenuPosition)
    const popoverKey = useMemo(() => Math.random().toString(16).slice(2), [position])

    const search = useSearch(nodeDefinitionsList, {
        keys: ["name", "package"],
        threshold: 0.4,
    })

    const closePopover = () => gbx.store.setState({ contextMenuPosition: null })

    const exitTransition: Transition = { duration: 0.1 }

    return (
        <AnimatePresence>
            {!!position && <Popover
                key={popoverKey}
                open onOpenChange={isOpen => {
                    if (!isOpen)
                        closePopover()
                }}
            >
                <PopoverAnchor asChild>
                    <motion.div
                        className="fixed pointer-events-none"
                        style={{ top: position.y, left: position.x }}
                        exit={{ opacity: 0, transition: exitTransition }}
                    >
                        <div className="w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                </PopoverAnchor>
                <PopoverContent className="w-[300px] p-0" asChild>
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
                                        // style={{ color: definition.color }}
                                        >
                                            <TI><def.icon /></TI>
                                            <span>{def.name}</span>
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

    return (
        <NodeContext.Provider value={n.id}>
            <motion.div
                className={cn(
                    "absolute pointer-events-auto",
                    isDragging ? "cursor-grabbing" : "cursor-pointer",
                )}
                style={{ x: n.position.x, y: n.position.y }}
                ref={el => {
                    if (!el) return
                    const updates: Partial<Node> = {}

                    if (n._element !== el) {
                        updates._element = el
                    }
                    if (n._shouldCenterSelf) {
                        n.position.x.set(n.position.x.get() - el.offsetWidth / 2)
                        n.position.y.set(n.position.y.get() - el.offsetHeight / 2)
                        updates._shouldCenterSelf = false
                    }

                    if (Object.keys(updates).length > 0) {
                        gbx.setNodeState(n.id, updates)
                    }
                }}

                onPanStart={startDrag}
                onPan={(e, info) => {
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
                }}
                // For detecting tap's that aren't part of a pan
                onTap={tapControls.registerTap}
                onPanEnd={(e, info) => {
                    tapControls.registerPanEnd(e, info)
                    endDrag()
                }}
                onPointerEnter={() => gbx.store.setState({ currentlyHoveredNodeDefId: n.definitionId })}
                onPointerLeave={() => gbx.store.setState({ currentlyHoveredNodeDefId: null })}
            >
                {children}
            </motion.div>
        </NodeContext.Provider>
    )
}


// #region EdgeRenderer
function EdgeRenderer() {
    const gbx = useGraphBuilder()
    const edges = gbx.useStore(useShallow(
        s => Array.from(s.edges.values())
            .filter(e => {
                const source = s.nodes.get(e.s)
                const target = s.nodes.get(e.t)
                return source?._element && target?._element
            })
    ))

    const connection = gbx.useStore(s => s.connection)

    return (
        <svg
            className="absolute z-[9] top-0 left-0 w-full h-full pointer-events-none"
        >
            <motion.g x={0} y={0} width={0} height={0} style={{
                x: gbx.state.pan.x,
                y: gbx.state.pan.y,
                scale: gbx.state.zoom,
                originX: "0px",
                originY: "0px",
            }}>
                {edges.map(e => <Edge key={e.id} id={e.id} />)}

                {connection && <ConnectionLine />}
            </motion.g>
        </svg>
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
        <g className="group cursor-pointer">
            <g
                style={{ pointerEvents: "stroke" }}
                onClick={(ev) => {
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
                />
                <motion.path
                    className="group-hover:stroke-gray-400/20 stroke-[20px] fill-none"
                    style={{ strokeLinecap: "round" }}
                    d={path}
                />
                <motion.path
                    className="stroke-gray-400 stroke-[4px] fill-none"
                    style={{ strokeLinecap: "round" }}
                    d={path}
                />
            </g>
            <EdgeLabel mx={mid.x} my={mid.y}>
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
            </EdgeLabel>
        </g>
    )
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
    resolveNodeDefinition: (nodeDefinitionId: string) => NodeDefinition
}

export class GraphBuilder {

    public store = createStore<GraphBuilderStoreState>(() => ({
        nodes: new Map(),
        edges: new Map(),

        selection: new Set(),

        viewportElement: null,
        pan: { x: motionValue(0), y: motionValue(0) },
        zoom: motionValue(1),

        boxSelection: null,
        connection: null,

        screenMousePosition: { x: motionValue(0), y: motionValue(0) },
        currentlyHoveredNodeDefId: null,

        contextMenuPosition: null,
    }))

    constructor(public options: GraphBuilderOptions) { }

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

    addNode(
        node: Partial<Omit<Node, "definitionId" | "position">> & {
            definitionId: string
            position?: { x: number, y: number }
        }
    ): Node {
        const newNode: Node = {
            id: createRandomId(IdNamespace.ActionNode),
            handleStates: {},
            config: {},
            ...node,
            position: {
                x: motionValue(node.position?.x ?? 0),
                y: motionValue(node.position?.y ?? 0),
            },
        }
        this.store.setState(s => ({
            nodes: new Map([...s.nodes, [newNode.id, newNode]]),
        }))
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
        })
    }

    deleteNodes(ids: string[]) {
        this.mutateState(s => {
            ids.forEach(id => s.nodes.delete(id))
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
        return this.options.resolveNodeDefinition(definitionId)
    }

    getNodeDefinitionForNode(nodeId: string) {
        if (!this.state.nodes.has(nodeId))
            throw new Error(`Node with ID ${nodeId} does not exist.`)
        return this.options.resolveNodeDefinition(this.state.nodes.get(nodeId)!.definitionId)
    }

    // getInputDefinition(nodeId: string, inputDefId: string) {
    //     return this.getNodeDefinition(nodeId).inputs[inputDefId]
    // }

    // getOutputDefinition(nodeId: string, outputDefId: string) {
    //     return this.getNodeDefinition(nodeId).outputs[outputDefId]
    // }

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

        // wilo: checking value types
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

    usePointerPosition() {
        const mx = useMotionValue(NaN)
        const my = useMotionValue(NaN)
        const [ready, setReady] = useBooleanState()
        const onPointerMove = (e: PointerEvent) => {
            const viewportRect = this.state.viewportElement!.getBoundingClientRect()
            const p = this.state.pan
            const z = this.state.zoom.get()
            mx.set((e.clientX - viewportRect.x - p.x.get()) / z)
            my.set((e.clientY - viewportRect.x - p.y.get()) / z)
            setReady()
        }
        useEffect(() => {
            window.addEventListener("pointermove", onPointerMove)
            return () => window.removeEventListener("pointermove", onPointerMove)
        }, [mx, my])
        return [{ x: mx, y: my }, ready] as const
    }
}

// #region Store State
export type GraphBuilderStoreState = {
    nodes: Map<string, Node>
    edges: Map<string, Edge>

    selection: Set<string>

    viewportElement: HTMLDivElement | null
    pan: MotionCoordPair
    zoom: MotionValue<number>

    boxSelection: null | {
        start: MotionCoordPair
        offset: MotionCoordPair
    }

    connection: null | Connection

    screenMousePosition: MotionCoordPair
    currentlyHoveredNodeDefId: string | null

    contextMenuPosition: { x: number, y: number } | null
}

/**
 * Properties prefixed with underscores are considered private and 
 * will not be serialized when saving the graph state.
 */
export type Node = {
    id: string
    // definition: string
    position: MotionCoordPair
    _element?: HTMLElement
    _handlePositions?: Record<string, MotionCoordPair>

    definitionId: string
    handleStates: Record<string, HandleState>

    config: Record<string, any>

    _shouldCenterSelf?: boolean
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


export function handleIndexingId(name: string, index?: number) {
    return `${name}${index != null ? `.${index}` : ""}`
}

export function getDefinitionPackageName(definitionId: string) {
    const segments = definitionId.split("/")
    return segments.length > 1
        ? segments[0].toLowerCase()
            .replaceAll(/[^A-Za-z0-9]+/g, " ")
            .replaceAll(/(?<!\w)[a-z]/g, c => c.toUpperCase())
        : undefined
}

function usePinnedNodes() {
    const pinnedNodes = useLocalStorageValue("graph-builder-pinned-nodes", {
        defaultValue: ["primitives/text", "primitives/number"],
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