import { useDebouncedEffect, useDebouncedState } from "@react-hookz/web"
import { useSupabaseMutation } from "@web/modules/db"
import { useMountDelay } from "@web/modules/util"
import { useWorkflow } from "@web/modules/workflows"
import _ from "lodash"
import { useEffect, useMemo } from "react"
import { useEdges, useNodes } from "reactflow"
import { useEditorStoreApi } from "../store"
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
            .update({
                graph: convertedGraph as any,
                last_edited_at: new Date().toISOString(),
            })
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

    const editorStore = useEditorStoreApi()

    const shouldSave = isWorkflowLoaded
        && !updateGraph.isPending
        && isReadyToSave
        && !(convertedGraph.nodes.length === 0 && convertedGraph.edges.length === 0)

    useEffect(() => {
        if (shouldSave)
            editorStore.setState({ saving: true })
    }, [convertedGraphStr])

    useDebouncedEffect(() => {
        if (shouldSave) {
            console.debug("Saving graph...", convertedGraph)
            updateGraph.mutateAsync(null).then(() => {
                console.debug("Graph saved")
                editorStore.setState({ saving: false })
            })
        }
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