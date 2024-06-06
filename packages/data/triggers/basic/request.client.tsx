import { clientTrigger } from "@pkg/helpers/client"
import "@pkg/types/client"
import "@pkg/types/shared"
import { TriggerConfigHeader } from "@web/app/workflows/[workflowId]/edit/_components/trigger-config"
import CopyButton from "@web/components/copy-button"
import { TbLink } from "react-icons/tb"
import shared from "./request.shared"

export default clientTrigger(shared, {
    icon: TbLink,
    color: "#4b5563",
    tags: ["Basic"],
    renderConfig: ({ workflowId }) => {

        const triggerUrl = `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/trigger/request`

        return (
            <div>
                <TriggerConfigHeader>Workflow URL:</TriggerConfigHeader>
                <p className="text-xs max-w-full font-mono text-ellipsis line-clamp-2 break-all bg-secondary border p-2 rounded-md">
                    {triggerUrl}
                </p>
                <CopyButton
                    onClick={() => navigator.clipboard.writeText(triggerUrl)}
                    size="sm"
                >
                    Copy URL
                </CopyButton>
            </div>
        )
    },
})