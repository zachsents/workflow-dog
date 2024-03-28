"use client"

import { EditorStoreProvider, useEditorStore } from "@web/modules/workflow-editor/store"
import { useWorkflow } from "@web/modules/workflows"
import { ReactFlowProvider } from "reactflow"
import Loader from "@web/components/loader"
import WorkflowGraphEditor from "./graph-editor"


export default function EditorRenderer() {

    const { isSuccess } = useWorkflow()

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

    return (
        <>
            <ReactFlowProvider>
                <WorkflowGraphEditor initialGraph={workflow!.graph as any} />
                {/* <WorkflowGraphEditor initialGraph={{
                    nodes: [
                        { id: '1', data: { label: 'Input Node' }, position: { x: 250, y: 50 } },
                        { id: '2', data: { label: 'Output Node' }, position: { x: 250, y: 250 } },

                    ],
                    edges: [],
                }} /> */}
            </ReactFlowProvider>

            {hasSelectedRun &&
                <ReactFlowProvider key={selectedRunId}>
                    {/* <RunGraphView /> */}
                </ReactFlowProvider>}
        </>
    )
}