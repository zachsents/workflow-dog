import { useLocalStorage } from "@mantine/hooks"
import { Button, Card, Input, Kbd, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@nextui-org/react"
import { useLocalStorageValue } from "@react-hookz/web"
import { useCreateActionNode } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import { object as nodeDefs } from "nodes/web"
import { useMemo, useState } from "react"
import { TbArrowBack, TbArrowForward, TbClipboardText, TbCopy, TbPinnedOff } from "react-icons/tb"
import { useReactFlow, useStore, useStoreApi } from "reactflow"
import Group from "../layout/Group"
import NodeSearch from "./NodeSearch"
import { AnimatePresence } from "framer-motion"


export default function ContextMenu() {

    const rf = useReactFlow()
    const { setState } = useStoreApi()

    const position = useStore(s => s.contextMenu)
    const isOpen = !!position
    const close = () => setState({ contextMenu: null })

    const [query, setQuery] = useState("")

    const createNode = useCreateActionNode()

    const addNode = definition => {
        createNode({
            definition: definition.id,
            position: rf.screenToFlowPosition(position),
        })
        close()
    }

    const { value: pinned } = useLocalStorageValue("pinnedNodes")

    const popoverKey = useMemo(() => Math.random().toString(16).slice(2), [position])

    return (
        <AnimatePresence>
            <Popover
                key={popoverKey}
                isOpen={isOpen} onClose={close}
                placement="bottom"
                motionProps={{
                    onAnimationComplete: () => {
                        if (!isOpen)
                            setQuery("")
                    },
                }}
            >
                <PopoverTrigger>
                    <div
                        className={classNames("fixed w-3 h-3 bg-primary rounded-full transition-opacity -translate-x-1/2 -translate-y-1/2", {
                            "opacity-0": !isOpen,
                        })}
                        style={{
                            top: `${position?.y}px`,
                            left: `${position?.x}px`,
                        }}
                    />
                </PopoverTrigger>
                <PopoverContent
                    className="bg-transparent border-none shadow-none"
                >
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
                            autoFocus
                        />
                        <Card>
                            {query ?
                                <div className="flex flex-col items-stretch gap-1 p-1">
                                    <NodeSearch query={query} onAdd={addNode} maxResults={8} />
                                </div> :
                                <ControlList onClose={close} />}
                        </Card>
                    </div>
                </PopoverContent>
            </Popover>
        </AnimatePresence>
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


function ControlList({ onClose }) {

    const actions = {
        undo: useStore(s => s.undo),
        redo: useStore(s => s.redo),
        copy: useStore(s => s.copy),
        paste: useStore(s => s.paste),
    }

    const onAction = action => {
        actions[action]?.()
        onClose?.()
    }

    return (
        <Listbox onAction={onAction}>
            <ListboxItem
                startContent={<TbArrowBack />}
                endContent={<Kbd keys={["command"]}>Z</Kbd>}
                key="undo"
            >
                Undo
            </ListboxItem>
            <ListboxItem
                startContent={<TbArrowForward />}
                endContent={<Kbd keys={["command"]}>Y</Kbd>}
                key="redo"
            >
                Redo
            </ListboxItem>
            <ListboxItem
                startContent={<TbCopy />}
                endContent={<Kbd keys={["command"]}>C</Kbd>}
                key="copy"
            >
                Copy
            </ListboxItem>
            <ListboxItem
                startContent={<TbClipboardText />}
                endContent={<Kbd keys={["command"]}>V</Kbd>}
                key="paste"
            >
                Paste
            </ListboxItem>
        </Listbox>
    )
}