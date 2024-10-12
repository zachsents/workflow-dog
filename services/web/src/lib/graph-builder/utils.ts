import { isMotionValue, motionValue, MotionValue } from "framer-motion"
import _ from "lodash"
import { useMemo } from "react"
import SuperJSON from "superjson"
import { z } from "zod"
import { useSearch } from "../hooks"
import { stripUnderscoredProperties } from "../utils"
import { createNode, useGraphBuilder, type Edge, type Node } from "./core"


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
    const segments = definitionId.split(/[/:]/g)
    return segments.length > 2
        ? segments[1].toLowerCase()
            .replaceAll(/[^A-Za-z0-9]+/g, " ")
            .replaceAll(/(?<!\w)[a-z]/g, c => c.toUpperCase())
        : undefined
}


export function serializeGraph(graph: { nodes: Node[], edges: Edge[], [k: string]: any }) {
    const stripped = stripUnderscoredProperties(graph)
    const converted = _.cloneDeepWith(stripped, v => {
        if (isMotionValue(v))
            return v.get()
    })
    return SuperJSON.stringify(converted)
}

export function deserializeGraph(content: string) {
    const { nodes, edges, ...rest } = z.object({
        nodes: z.object({ id: z.string(), definitionId: z.string() }).passthrough().array(),
        edges: z.object({ id: z.string() }).passthrough().array(),
    }).passthrough().parse(SuperJSON.parse(content))

    return {
        nodes: nodes.map(n => createNode(n)),
        edges: edges as Edge[],
        ...rest
    }
}


export function shouldBeMotionValue<T>(value: T | MotionValue<T>) {
    return (isMotionValue(value) ? value : motionValue(value)) as MotionValue<T>
}

