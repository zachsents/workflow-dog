import { useLocalStorage, useWindowEvent } from "@mantine/hooks"
import { Button, Card, Input, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@nextui-org/react"
import { createActionNode } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import { produce } from "immer"
import { object as nodeDefs } from "nodes/web"
import { useEffect, useMemo, useRef, useState } from "react"
import { TbArrowBack, TbArrowForward, TbPinnedOff } from "react-icons/tb"
import { useReactFlow, useStore, useStoreApi } from "reactflow"
import Group from "../layout/Group"
import NodeSearch from "./NodeSearch"


export default function ContextMenu() {

    const rf = useReactFlow()

    const { setState } = useStoreApi()

    const isOpen = useStore(s => s.contextMenu?.opened) || false
    const screen = useStore(s => s.contextMenu?.screenPosition) || {}
    const position = useStore(s => s.graphPosition) || {}

    const close = () => setState(produce(draft => {
        draft.contextMenu.opened = false
    }))
    const andClose = (fn) => () => {
        fn()
        close()
    }

    const undo = useStore(s => s.undo)
    const redo = useStore(s => s.redo)

    const searchRef = useRef()
    const [query, setQuery] = useState("")
    const resultContainerRef = useRef()

    useEffect(() => {
        if (isOpen)
            setQuery("")
    }, [isOpen])

    useWindowEvent("keydown", ev => {
        if (!isOpen || ev.key == "Tab" || ev.key == "Shift")
            return

        if (ev.key == "Escape")
            return close()

        if (!ev.ctrlKey && global.document.activeElement != searchRef.current)
            searchRef.current?.focus()
    })

    const addNode = definition => {
        createActionNode(rf, definition.id, position)
        close()
    }

    const [pinned] = useLocalStorage({
        key: "pinnedNodes",
    })

    const popoverKey = useMemo(() => Math.random().toString(16).slice(2), [screen])

    return (
        <Popover
            key={popoverKey}
            isOpen={isOpen} onClose={close}
            placement="bottom"
            motionProps={{
                onAnimationEnd: () => {
                    setQuery("")
                }
            }}
        >
            <PopoverTrigger>
                <div
                    className={classNames({
                        "absolute w-3 h-3 bg-primary rounded-full transition-opacity": true,
                        "opacity-0": !isOpen,
                    })}
                    style={{
                        top: `${screen?.y}px`,
                        left: `${screen?.x}px`,
                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="bg-transparent border-none shadow-none">
                <div className="flex flex-col items-stretch gap-unit-xs w-50 relative">
                    <Group className="justify-center absolute bottom-full left-1/2 mb-8 -translate-x-1/2 w-60 gap-2">
                        {pinned?.filter(id => id in nodeDefs).map((id, i) =>
                            <PinnedNode id={id} onAdd={addNode} key={i} />
                        )}
                    </Group>

                    <Input
                        value={query} onValueChange={setQuery}
                        placeholder="Start typing to search nodes..."
                        size="sm"
                        ref={searchRef}
                        autoFocus
                    />

                    <Card>
                        {query ?
                            <div className="flex flex-col items-stretch gap-1 p-1" ref={resultContainerRef}>
                                <NodeSearch query={query} onAdd={addNode} maxResults={8} />
                            </div> :
                            <Listbox>
                                <ListboxItem
                                    onPress={andClose(undo)}
                                    startContent={<TbArrowBack />}
                                    shortcut="Ctrl+Z"
                                    key="undo"
                                >
                                    Undo
                                </ListboxItem>
                                <ListboxItem
                                    onPress={andClose(redo)}
                                    startContent={<TbArrowForward />}
                                    shortcut="Ctrl+Y"
                                    key="redo"
                                >
                                    Redo
                                </ListboxItem>
                            </Listbox>}
                    </Card>
                </div>
            </PopoverContent>
        </Popover>
    )
}


function PinnedNode({ id, onAdd }) {

    const definition = nodeDefs[id]
    const [unpinning, setUnpinning] = useState(false)
    const toggleUnpinning = () => setUnpinning(!unpinning)

    const [, setPinnedNodes] = useLocalStorage({
        key: "pinnedNodes",
    })
    const unpin = () => setPinnedNodes(pinned => pinned.filter(p => p != id))

    return (
        <Tooltip content={`${unpinning ? "Unpin" : "Add"} "${definition.name}"`} closeDelay={0}>
            <Button
                isIconOnly variant="faded"
                onPress={() => {
                    if (unpinning)
                        unpin()
                    else
                        onAdd?.(definition)
                }}
                onContextMenu={ev => {
                    ev.preventDefault()
                    toggleUnpinning()
                }}
            >
                {unpinning ?
                    <TbPinnedOff /> :
                    <definition.icon />}
            </Button>
        </Tooltip>
    )
}