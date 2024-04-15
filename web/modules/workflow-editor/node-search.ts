import { useDebouncedCallback, useSet } from "@react-hookz/web"
import "client-only"
import Fuse, { type FuseResult } from "fuse.js"
import { NodeDefinitions } from "packages/client"
import { useRef, useState } from "react"


export type NodeSearchResult = FuseResult<typeof NodeDefinitions.asArray[0]>

const nodesFuseIndex = new Fuse(NodeDefinitions.asArray, {
    includeScore: true,
    keys: ["name", "description", "tags", "searchTerms"],
})

export const AllNodeDefinitionTags = Array.from(new Set(NodeDefinitions.asArray.flatMap(node => node.tags)))

const tagsFuseIndex = new Fuse(AllNodeDefinitionTags, {
    includeScore: true,
})


export interface UseSearchNodesOptions {
    debounce?: number
    limit?: number
    tagsLimit?: number
    withFilters?: boolean
}

export function useSearchNodes({
    debounce = 200,
    limit = 8,
    tagsLimit = 5,
    withFilters = false,
}: UseSearchNodesOptions = {}) {

    const inputRef = useRef<HTMLInputElement>(null)

    const [hasQuery, setHasQuery] = useState(false)
    const [fuseNodeSearchResults, setFuseNodeSearchResults] = useState<NodeSearchResult[]>([])

    const filters = useSet<string>()
    const [fuseTagSearchResults, setFuseTagSearchResults] = useState<FuseResult<string>[]>([])

    const onSearchChange = useDebouncedCallback((query: string) => {
        setHasQuery(!!query)
        setFuseNodeSearchResults(nodesFuseIndex.search(query, { limit }))
        if (withFilters)
            setFuseTagSearchResults(tagsFuseIndex.search(query, { limit: tagsLimit }))
    }, [limit, withFilters], debounce)

    const searchResults = fuseNodeSearchResults.filter(result => Array.from(filters).every(tag => result.item.tags.includes(tag)))

    const tagSearchResults = withFilters
        ? fuseTagSearchResults.filter(result => !filters.has(result.item))
        : []

    return {
        searchResults,
        onSearchChange,
        inputRef,
        tagSearchResults,
        filters,
        hasQuery,
    } as const
}