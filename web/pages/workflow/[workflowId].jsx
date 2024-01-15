import { Spinner } from "@nextui-org/react"
import Center from "@web/components/layout/Center"
import EditHeader from "@web/components/workflow-editor/EditHeader"
import { useMustBeSignedIn } from "@web/modules/auth"
import { useQueryParam } from "@web/modules/router"
import { ReactFlowProvider } from "reactflow"


export default function WorkflowPage() {

    useMustBeSignedIn()
    const [workflowId] = useQueryParam("workflowId")

    return workflowId ?
        <ReactFlowProvider>
            <div className="flex flex-col grow">
                <EditHeader />
                {/* <TriggerBar />
                <Group spacing={0} className="flex-1" align="stretch">
                    <EditorActivityBar />
                    <GraphEditor />
                </Group> */}
            </div>
        </ReactFlowProvider> :
        <Center className="w-screen h-screen">
            <Spinner />
        </Center>
}
