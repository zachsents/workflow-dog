import { useMemo } from "react"
import { useGraphBuilder } from "./core"
import { useSearch } from "../hooks"


export function useNodeDefinitionsSearch() {
    const gbx = useGraphBuilder()
    const nodeDefinitionsList = useMemo(() => Object.entries(gbx.options.nodeDefinitions).map(([id, def]) => ({
        id,
        name: def.name,
        package: getDefinitionPackageName(id),
    })), [gbx.options.nodeDefinitions])

    const search = useSearch(nodeDefinitionsList, {
        keys: ["name", "package", "keywords"],
        threshold: 0.4,
    })

    return [search, nodeDefinitionsList] as const
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