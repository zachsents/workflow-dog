import { Spinner } from "@nextui-org/react"
import Center from "@web/components/layout/Center"
import EditHeader from "@web/components/workflow-editor/EditHeader"
import GraphEditor from "@web/components/workflow-editor/GraphEditor"
import RunViewer from "@web/components/workflow-editor/RunViewer"
import Runner from "@web/components/workflow-editor/Runner"
import TriggerControl from "@web/components/workflow-editor/TriggerControl"
import { useMustBeSignedIn } from "@web/modules/auth"
import { useQueryParam } from "@web/modules/router"
import { EditorStoreProvider } from "@web/modules/workflow-editor/store"
import { useWorkflow } from "@web/modules/workflows"
import { ReactFlowProvider } from "reactflow"


export default function WorkflowPage() {

    useMustBeSignedIn()
    const [workflowId] = useQueryParam("workflowId")
    const { data: workflow, isSuccess } = useWorkflow()

    return workflowId ?
        <EditorStoreProvider>
            <ReactFlowProvider>
                <div className="flex flex-col items-stretch grow">
                    <EditHeader />
                    <div className="relative flex-1 flex items-stretch justify-stretch flex-col">
                        <div className="absolute top-0 left-0 w-full p-unit-xs pointer-events-none z-[1] flex justify-between items-start">
                            <TriggerControl />
                            <div className="flex flex-col items-end gap-unit-xs">
                                <Runner />
                                <RunViewer />
                            </div>
                        </div>

                        {isSuccess ?
                            <GraphEditor initialGraph={workflow?.graph} /> :
                            <Center className="w-full flex-1">
                                <Spinner />
                            </Center>}
                    </div>
                </div>
            </ReactFlowProvider>
        </EditorStoreProvider> :
        <Center className="w-screen h-screen">
            <Spinner />
        </Center>
}
