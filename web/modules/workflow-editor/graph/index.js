import { useDebouncedValue } from "@mantine/hooks"
import _ from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useReactFlow, useStore, useStoreApi } from "reactflow"
import { useUpdateWorkflow, useUpdateWorkflowGraph, useWorkflowGraph } from "../../workflows"
import { produce } from "immer"


export function useGraphSaving(nodes, edges, setNodes, setEdges) {

    const [updateWorkflow] = useUpdateWorkflow()
    const [remoteGraph, isGraphLoaded] = useWorkflowGraph()
    const [updateGraph] = useUpdateWorkflowGraph()
    const [canSave, setCanSave] = useState(false)

    useEffect(() => {
        if (isGraphLoaded) {
            setCanSave(true)

            const { nodes: newNodes, edges: newEdges } = merge({ nodes, edges }, remoteGraph, ["selected"])

            setNodes(newNodes)
            setEdges(newEdges)
            console.debug("Merged from remote", remoteGraph)
        }
    }, [remoteGraph])

    const convertedGraph = useMemo(() => convertGraphForRemote({ nodes, edges }), [nodes, edges])
    const [debouncedConvertedGraph] = useDebouncedValue(convertedGraph, 500)

    useEffect(() => {
        if (canSave) {
            updateGraph({ nodes, edges })
            updateWorkflow({ lastEditedAt: new Date() })
            console.debug("Updating remote graph")
        }
    }, [debouncedConvertedGraph])
}


/**
 * @param {import("reactflow").Node[] | string[]} nodes
 * @param {import("reactflow").Edge[] | string[]} edges
 */
export function useDeleteElements(nodes, edges) {
    const rf = useReactFlow()

    const nodeObjects = nodes?.every(n => typeof n === "string") ?
        nodes?.map(n => rf.getNode(n)) :
        nodes
    const edgeObjects = edges?.every(e => typeof e === "string") ?
        edges?.map(e => rf.getEdge(e)) :
        edges

    return useCallback(() => rf.deleteElements({
        nodes: nodeObjects,
        edges: edgeObjects,
    }), [nodes, edges, rf])
}


/**
 * Hook to control a property of the RF store
 * @param {string} property
 */
export function useRFStoreProperty(path, defaultValue) {
    const storeApi = useStoreApi()

    const value = useStore(s => _.get(s, path))
    const setValue = useCallback(newValue => {
        storeApi.setState(produce(draft => {
            _.set(draft, path, newValue)
        }))
    }, [storeApi, path])

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [defaultValue, value, setValue])

    return [value, setValue]
}


/**
 * @param {string} graphStr
 */
export function convertGraphFromRemote(graphStr) {
    try {
        const graph = JSON.parse(graphStr)
        return graph
    }
    catch (err) {
        return {
            nodes: [],
            edges: [],
        }
    }
}


/**
 * @param {{ nodes: import("reactflow").Node[], edges: import("reactflow").Edge[] }} graph
 */
export function convertGraphForRemote(graph) {
    return JSON.stringify({
        nodes: graph.nodes.map(n => _.omit(n, ["selected"])),
        edges: graph.edges.map(e => _.omit(e, ["selected"])),
    })
}


function merge(destination, source, keepDestinationProps = []) {

    if (Array.isArray(source)) {
        const usingIds = source.every(el => "id" in el)

        if (usingIds)
            return source.map(sourceItem => merge(destination?.find(destItem => destItem.id === sourceItem.id), sourceItem, keepDestinationProps))

        return source.map((sourceItem, i) => merge(destination?.[i], sourceItem, keepDestinationProps))
    }

    if (typeof source === "object" && source !== null) {
        const result = Object.fromEntries(
            Object.entries(source).map(([key, value]) => [key, merge(destination?.[key], value, keepDestinationProps)])
        )
        keepDestinationProps.forEach(prop => result[prop] = destination?.[prop])
        return result
    }

    return source
}