import { useDebouncedEffect, useDebouncedState } from "@react-hookz/web"
import { useDatabaseMutation } from "@web/modules/db"
import { useMountDelay } from "@web/modules/util"
import { useWorkflow } from "@web/modules/workflows"
import { produce } from "immer"
import _ from "lodash"
import { useCallback, useEffect, useMemo } from "react"
import { useEdges, useNodes, useStore, useStoreApi } from "reactflow"


export function useGraphSaving() {

    const nodes = useNodes()
    const edges = useEdges()

    const { data: workflow, isSuccess: isWorkflowLoaded } = useWorkflow()

    const [debouncedRawGraph, onGraphChange] = useDebouncedState({ nodes, edges }, 250)
    useEffect(() => {
        if (!isWorkflowLoaded)
            return

        onGraphChange({ nodes, edges })
    }, [nodes, edges, isWorkflowLoaded])

    const convertedGraph = useMemo(() => convertGraphForRemote(debouncedRawGraph), [debouncedRawGraph])
    const convertedGraphStr = useMemo(() => JSON.stringify(convertedGraph), [convertedGraph])

    const updateGraph = useDatabaseMutation(
        (supa) => supa.from("workflows").update({ graph: convertedGraph }).eq("id", workflow?.id),
        {
            enabled: !!workflow,
            // invalidateKey: ["workflow", workflow?.id],
        }
    )

    const isReadyToSave = useMountDelay(1000, {
        callback: () => console.debug("Ready to save graph"),
        enabled: isWorkflowLoaded,
    })

    useDebouncedEffect(() => {
        if (!isWorkflowLoaded || updateGraph.isPending || !isReadyToSave)
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