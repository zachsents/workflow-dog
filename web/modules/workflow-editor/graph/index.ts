import { useDebouncedEffect, useDebouncedState } from "@react-hookz/web"
import { useSupabaseMutation } from "@web/modules/db"
import { useMountDelay } from "@web/modules/util"
import { useWorkflow } from "@web/modules/workflows"
import _ from "lodash"
import { useEffect, useMemo } from "react"
import { useEdges, useNodes } from "reactflow"
import { WorkflowGraph } from "../types"


export function useGraphSaving() {

    const nodes = useNodes()
    const edges = useEdges()

    const { data: workflow, isSuccess: isWorkflowLoaded } = useWorkflow()

    const [debouncedRawGraph, onGraphChange] = useDebouncedState<WorkflowGraph>({ nodes, edges }, 250)
    useEffect(() => {
        if (!isWorkflowLoaded)
            return

        onGraphChange({ nodes, edges })
    }, [nodes, edges, isWorkflowLoaded])

    const convertedGraph = useMemo(() => convertGraphForRemote(debouncedRawGraph), [debouncedRawGraph])
    const convertedGraphStr = useMemo(() => JSON.stringify(convertedGraph), [convertedGraph])

    const updateGraph = useSupabaseMutation(
        (supabase) => supabase
            .from("workflows")
            .update({ graph: convertedGraph as any })
            .eq("id", workflow!.id) as any,
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

        // Prevent empty graph from being saved -- this happens sometimes
        if (convertedGraph.nodes.length === 0 && convertedGraph.edges.length === 0)
            return console.debug("Graph is empty, not saving")

        console.debug("Saving graph...", convertedGraph)
        updateGraph.mutateAsync(null).then(() => console.log("Graph saved"))
    }, [convertedGraphStr], 1000)
}


export function convertGraphFromRemote(graph: WorkflowGraph) {
    return graph
}


export function convertGraphForRemote(graph: WorkflowGraph) {
    return {
        nodes: graph.nodes.map(n => _.omit(n, "selected")),
        edges: graph.edges.map(e => _.omit(e, "selected")),
    }
}