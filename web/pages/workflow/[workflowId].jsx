import { Spinner } from "@nextui-org/react"
import Center from "@web/components/layout/Center"
import EditHeader from "@web/components/workflow-editor/EditHeader"
import GraphEditor from "@web/components/workflow-editor/GraphEditor"
import TriggerControl from "@web/components/workflow-editor/TriggerControl"
import { useMustBeSignedIn } from "@web/modules/auth"
import { useQueryParam } from "@web/modules/router"
import { useWorkflow } from "@web/modules/workflows"
import { ReactFlowProvider } from "reactflow"


export default function WorkflowPage() {

    useMustBeSignedIn()
    const [workflowId] = useQueryParam("workflowId")
    const { data: workflow, isSuccess } = useWorkflow()

    return workflowId ?
        <ReactFlowProvider>
            <div className="flex flex-col items-stretch grow">
                <EditHeader />
                <div className="relative flex-1 flex items-stretch justify-stretch flex-col">
                    <div className="absolute top-0 left-0 p-unit-xs pointer-events-none z-[1]">
                        <TriggerControl />
                    </div>
                    {isSuccess ?
                        <GraphEditor initialGraph={workflow?.graph} /> :
                        <Center className="w-full flex-1">
                            <Spinner />
                        </Center>}
                </div>
            </div>
        </ReactFlowProvider> :
        <Center className="w-screen h-screen">
            <Spinner />
        </Center>
}
