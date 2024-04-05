import { createClientTriggerDefinition } from "@pkg/types"
import { Checkbox } from "@ui/checkbox"
import { Button } from "@web/components/ui/button"
import { Label } from "@web/components/ui/label"
import { useEffect, useState } from "react"
import { TbCopy, TbLink } from "react-icons/tb"
import { toast } from "sonner"
import shared from "./shared"


export default createClientTriggerDefinition(shared, {
    tags: ["Basic"],
    icon: TbLink,
    color: "#1f2937",
    renderConfig: ({ workflowId, workflow, updateConfig, isUpdating }) => {

        const [waitUntilFinished, setWaitUntilFinished] = useState(workflow?.trigger?.config?.waitUntilFinished || false)

        useEffect(() => {
            if (isUpdating || workflow?.trigger?.config?.waitUntilFinished === waitUntilFinished)
                return

            const debugMessage = `Saving waitUntilFinished trigger setting: ${waitUntilFinished}`
            console.time(debugMessage)

            updateConfig({
                waitUntilFinished
            }).then(() => {
                console.timeEnd(debugMessage)
            })
        }, [waitUntilFinished])

        const triggerUrl = `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/trigger/request`

        return (
            <div className="flex-v items-stretch gap-4">
                <div className="flex-v gap-2">
                    <p className="font-bold">
                        Workflow URL:
                    </p>
                    <p className="text-xs max-w-full font-mono text-ellipsis line-clamp-2 break-all bg-secondary border p-2 rounded-md">
                        {triggerUrl}
                    </p>
                    <Button
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(triggerUrl)
                            toast.success("Copied!")
                        }}
                    >
                        <TbCopy className="mr-2" />
                        Copy URL
                    </Button>
                </div>

                <div className="flex-v gap-2">
                    <p className="font-bold">
                        Settings:
                    </p>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="trigger-waitUntilFinished"
                            checked={waitUntilFinished}
                            onCheckedChange={setWaitUntilFinished}
                        />
                        <Label htmlFor="trigger-waitUntilFinished">
                            Wait until the workflow finishes running
                        </Label>
                    </div>
                </div>
            </div>
        )
    }
})