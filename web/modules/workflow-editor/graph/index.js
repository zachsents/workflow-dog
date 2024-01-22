import { useDebouncedEffect, useDebouncedState } from "@react-hookz/web"
import { useDatabaseMutation } from "@web/modules/db"
import { useWorkflow } from "@web/modules/workflows"
import { produce } from "immer"
import _ from "lodash"
import { useCallback, useEffect, useMemo } from "react"
import { useEdges, useNodes, useStore, useStoreApi } from "reactflow"


export function useGraphSaving() {

    const nodes = useNodes()
    const edges = useEdges()

    const { data: workflow, isSuccess } = useWorkflow()

    const [debouncedRawGraph, onGraphChange] = useDebouncedState({ nodes, edges }, 250)
    useEffect(() => {
        if (!isSuccess)
            return

        onGraphChange({ nodes, edges })
    }, [nodes, edges, isSuccess])

    const convertedGraph = useMemo(() => convertGraphForRemote(debouncedRawGraph), [debouncedRawGraph])
    const convertedGraphStr = useMemo(() => JSON.stringify(convertedGraph), [convertedGraph])

    const updateGraph = useDatabaseMutation(
        (supa) => supa.from("workflows").update({ graph: convertedGraph }).eq("id", workflow?.id),
        {
            enabled: !!workflow,
            // invalidateKey: ["workflow", workflow?.id],
        }
    )

    useDebouncedEffect(() => {
        if (!isSuccess || updateGraph.isPending)
            return

        console.debug("Saving graph...", convertedGraph)
        updateGraph.mutateAsync().then(() => console.log("Graph saved"))
    }, [convertedGraphStr], 500)
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


export function convertGraphFromRemote(graph) {
    return graph
}


/**
 * @param {{ nodes: import("reactflow").Node[], edges: import("reactflow").Edge[] }} graph
 */
export function convertGraphForRemote(graph) {
    return {
        nodes: graph.nodes.map(n => _.omit(n, "selected")),
        edges: graph.edges.map(e => _.omit(e, "selected")),
    }
}


// eslint-disable-next-line no-unused-vars
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