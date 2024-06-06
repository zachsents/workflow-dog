import { useDebouncedEffect, useDebouncedState } from "@react-hookz/web"
import { useCurrentWorkflowId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { useMountDelay } from "@web/modules/util"
import { useWorkflow } from "@web/modules/workflows"
import _ from "lodash"
import { useEffect, useMemo } from "react"
import { useEdges, useNodes } from "reactflow"
import { toast } from "sonner"
import { useEditorStoreApi } from "../store"
import { WorkflowGraph } from "../types"


export function useGraphSaving() {

    const nodes = useNodes()
    const edges = useEdges()

    const workflowId = useCurrentWorkflowId()
    const { isSuccess: isWorkflowLoaded } = useWorkflow()

    const [debouncedRawGraph, onGraphChange] = useDebouncedState<WorkflowGraph>({ nodes, edges }, 250)
    useEffect(() => {
        if (!isWorkflowLoaded)
            return

        onGraphChange({ nodes, edges })
    }, [nodes, edges, isWorkflowLoaded])

    const convertedGraph = useMemo(() => convertGraphForRemote(debouncedRawGraph), [debouncedRawGraph])
    const convertedGraphStr = useMemo(() => JSON.stringify(convertedGraph), [convertedGraph])

    const {
        mutateAsync: updateGraph,
        isPending: isSaving,
    } = trpc.workflows.updateGraph.useMutation({
        onError: (error) => {
            console.debug(error)
            toast.error("Failed to save graph. If you're not offline, then this is probably a bug.")
        }
    })

    const isReadyToSave = useMountDelay(1000, {
        callback: () => console.debug("Ready to save graph"),
        enabled: isWorkflowLoaded,
    })

    const editorStore = useEditorStoreApi()

    const shouldSave = isWorkflowLoaded
        && !isSaving
        && isReadyToSave
        && !(convertedGraph.nodes.length === 0 && convertedGraph.edges.length === 0)

    useEffect(() => {
        if (shouldSave)
            editorStore.setState({ saving: true })
    }, [convertedGraphStr])

    useDebouncedEffect(() => {
        if (shouldSave) {
            console.debug("Saving graph...", convertedGraph)

            updateGraph({
                workflowId: workflowId,
                graph: convertedGraph,
            }).then(() => {
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
    const omitProps = ["selected", "dragging"]
    return {
        nodes: graph.nodes.map(n => _.omit(n, omitProps)),
        edges: graph.edges.map(e => _.omit(e, omitProps)),
    }
}