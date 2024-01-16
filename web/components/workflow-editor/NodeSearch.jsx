import { useDebouncedValue, useLocalStorage, useWindowEvent } from "@mantine/hooks"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { searchNodes } from "@web/modules/workflow-editor/search-nodes"
import { useEffect, useMemo, useState } from "react"
import { TbPin, TbPinnedOff } from "react-icons/tb"
import Group from "../layout/Group"


export default function NodeSearch({ query, tags, onAdd, maxResults = Infinity, showDescription = false, draggable = false, focused = false }) {

    const [debouncedQuery] = useDebouncedValue(query, 100)
    const results = useMemo(() => searchNodes(query, tags), [debouncedQuery, tags])

    const [selected, setSelected] = useState(0)

    useEffect(() => {
        setSelected(0)
    }, [query])

    useWindowEvent("keydown", ev => {
        if (!focused)
            return

        switch (ev.key) {
            case "ArrowDown":
                setSelected(Math.min(selected + 1, results.length - 1, maxResults - 1))
                ev.preventDefault()
                break
            case "ArrowUp":
                setSelected(Math.max(selected - 1, 0))
                ev.preventDefault()
                break
            case "Enter":
                onAdd?.(results[selected])
                ev.preventDefault()
        }
    })

    return (
        <>
            {results.slice(0, maxResults).map((result, i) =>
                <ResultRow
                    definition={result}
                    onAdd={onAdd}
                    showDescription={showDescription}
                    draggable={draggable}
                    selected={i === selected}
                    // key={result.id}
                    key={i}
                />
            )}
        </>
    )
}


function ResultRow({ definition, onAdd, showDescription = false, draggable = false }) {

    const [menuOpened, setMenuOpened] = useState(false)

    const [pinned, setPinned] = useLocalStorage({
        key: "pinnedNodes",
        defaultValue: [],
    })

    const isPinned = pinned.includes(definition.id)

    const addPinned = () => {
        setPinned([...new Set([...pinned, definition.id])])
    }

    const removePinned = () => {
        setPinned(pinned.filter(id => id != definition.id))
    }

    const [dragStartPosition, setDragStartPosition] = useState(false)
    const [dragPosition, setDragPosition] = useState(false)

    useWindowEvent("pointerup", ev => {
        if (dragStartPosition) {
            const distance = Math.sqrt((ev.clientX - dragStartPosition.x) ** 2 + (ev.clientY - dragStartPosition.y) ** 2)
            setDragStartPosition(false)
            setDragPosition(false)
            document.activeElement?.blur()

            if (distance < 10) {
                onAdd?.(definition)
                console.log("clicked")
            }
            else {
                if (!draggable)
                    return

                onAdd?.(definition, {
                    x: ev.clientX - 100,
                    y: ev.clientY - 50,
                })
            }
        }
    })

    useWindowEvent("pointermove", ev => {
        if (dragStartPosition && draggable) {
            setDragPosition({ x: ev.clientX, y: ev.clientY })
        }
    })

    return (<>
        <Dropdown
            isOpen={menuOpened} onOpen={() => setMenuOpened(true)} onClose={() => setMenuOpened(false)}
            disabled={!!dragStartPosition}
            placement="right"
        >
            <DropdownTrigger>
                <div
                    onContextMenu={ev => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        setMenuOpened(true)
                    }}
                    onPointerDown={ev => {
                        if (ev.button == 0) {
                            ev.preventDefault()
                            setDragStartPosition({ x: ev.clientX, y: ev.clientY })
                        }
                    }}
                >
                    <Group className="gap-unit-md">
                        <definition.icon />
                        <Group className="flex-col">
                            <p>{definition.name}</p>
                            {showDescription &&
                                <p className="text-sm text-default-500 line-clamp-3">
                                    {definition.description}
                                </p>}
                        </Group>
                    </Group>
                </div>
            </DropdownTrigger>
            <DropdownMenu>
                {isPinned ?
                    <DropdownItem startContent={<TbPinnedOff />} onClick={removePinned}>
                        Unpin
                    </DropdownItem> :
                    <DropdownItem startContent={<TbPin />} onClick={addPinned}>
                        Pin
                    </DropdownItem>}
            </DropdownMenu>
        </Dropdown>

        {dragPosition &&
            <div
                className="rounded base-border fixed -translate-x-1/2 -translate-y-1/2 z-[10]"
                style={{
                    left: dragPosition.x,
                    top: dragPosition.y,
                }}
            >
                <Group
                    className="gap-unit-xs px-unit-xs py-1 min-w-[16rem] text-white font-bold"
                    bg={definition.color}
                >
                    <definition.icon />
                    <span>{definition.name}</span>
                </Group>

                <Group noWrap position="apart" className="bg-white pb-xs pt-lg">
                    <Group className="flex-col w-[30%] -ml-2 gap-3">
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                    </Group>
                    <Group className="flex-col w-[30%] -mr-2 gap-3">
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                    </Group>
                </Group>
            </div>}
    </>)
}