import { useDebouncedValue } from "@mantine/hooks"
import { Listbox, ListboxItem } from "@nextui-org/react"
import { searchNodes } from "@web/modules/workflow-editor/search-nodes"
import { object as nodeDefs } from "nodes/web"
import { useMemo } from "react"


export default function NodeSearch({ query, tags, onAdd, maxResults = Infinity }) {

    const [debouncedQuery] = useDebouncedValue(query, 100)
    const results = useMemo(() => searchNodes(query, tags).slice(0, maxResults), [debouncedQuery, tags])

    const onAction = (defId) => onAdd?.(nodeDefs[defId])

    return (
        <Listbox onAction={onAction} items={results}>
            {item =>
                <ListboxItem
                    startContent={<item.icon className="bg-[var(--color)] text-white p-1 rounded-md text-2xl" />}
                    key={item.id}
                    style={{
                        "--color": item.color,
                    }}
                >
                    {item.name}
                </ListboxItem>}
        </Listbox>
    )
}
