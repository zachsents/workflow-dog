import { Spinner } from "@nextui-org/react"
import Center from "@web/components/layout/Center"
import EditHeader from "@web/components/workflow-editor/EditHeader"
import EditorControls from "@web/components/workflow-editor/EditorControls"
import GraphEditor from "@web/components/workflow-editor/GraphEditor"
import RunGraphView from "@web/components/workflow-editor/RunGraphView"
import { useMustBeSignedIn } from "@web/modules/auth"
import { EditorStoreProvider, useEditorStore } from "@web/modules/workflow-editor/store"
import { useWorkflow, useWorkflowIdFromUrl } from "@web/modules/workflows"
import classNames from "classnames"
import { ReactFlowProvider } from "reactflow"


export default function WorkflowPage() {

    useMustBeSignedIn()
    const workflowId = useWorkflowIdFromUrl()

    return workflowId ?
        <EditorStoreProvider>
            <Renderer />
        </EditorStoreProvider> :
        <Center className="w-screen h-screen">
            <Spinner />
        </Center>
}


function Renderer() {
    const { data: workflow, isSuccess } = useWorkflow()

    const isRunSelected = useEditorStore(s => !!s.selectedRunId)

    return (
        <div className="flex flex-col items-stretch grow">
            <ReactFlowProvider>
                <EditHeader />
                <div className="relative flex-1 flex items-stretch justify-stretch flex-col">
                    <EditorControls />

                    <div className="w-full h-full absolute top-0 left-0 z-10" >
                        {isSuccess ?
                            <>
                                <div className={classNames("w-full h-full", {
                                    "opacity-0 pointer-events-none": isRunSelected,
                                })}>
                                    <GraphEditor initialGraph={workflow?.graph} />
                                </div>

                                {isRunSelected &&
                                    <div className="absolute top-0 left-0 w-full h-full">
                                        <RunGraphView />
                                    </div>}
                            </> :
                            <Spinner
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            />
                        }
                    </div>
                </div>
            </ReactFlowProvider>
        </div>
    )
}