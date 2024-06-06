"use client"

import Loader from "@web/components/loader"
import { cn } from "@web/lib/utils"
import { EditorStoreProvider, useEditorStore } from "@web/modules/workflow-editor/store"
import { useInvalidateWorkflowRuns, useWorkflow } from "@web/modules/workflows"
import { ReactFlowProvider, type Edge, type Node } from "reactflow"
import WorkflowGraphEditor from "./graph-editor"
import CurrentRunGraph from "./run-controls/current-run-graph"
import CurrentRunHeader from "./run-controls/current-run-header"


export default function EditorRenderer() {

    const { isSuccess } = useWorkflow()

    useInvalidateWorkflowRuns()

    return isSuccess ?
        <div className="flex-1 relative">
            <div className="absolute top-0 left-0 w-full h-full">
                <EditorStoreProvider>
                    <ViewSwitcher />
                </EditorStoreProvider>
            </div>
        </div>
        :
        <div className="flex-1 flex center bg-slate-50">
            <Loader />
        </div>
}


/**
 * This component won't actually render at all unless the workflow is loaded.
 * `EditorRenderer` (defined above) takes care of that.
 */
function ViewSwitcher() {

    const selectedRunId = useEditorStore(s => s.selectedRunId)
    const hasSelectedRun = !!selectedRunId

    const { data: workflow } = useWorkflow()

    const graph = {
        nodes: workflow!.current_graph.nodes as unknown as Node[],
        edges: workflow!.current_graph.edges as unknown as Edge[],
    }

    return (
        <>
            <ReactFlowProvider>
                <WorkflowGraphEditor
                    initialGraph={graph}
                    className={cn(hasSelectedRun && "hidden")}
                />
            </ReactFlowProvider>

            {hasSelectedRun &&
                <ReactFlowProvider key={selectedRunId}>
                    <CurrentRunHeader />
                    <CurrentRunGraph />
                </ReactFlowProvider>}
        </>
    )
}