import { TriggerConfig, TriggerConfigHeader, TriggerSettingsForm } from "@pkg/_components/trigger-config"
import { createClientTriggerDefinition } from "@pkg/types"
import { Checkbox } from "@ui/checkbox"
import CopyButton from "@web/components/copy-button"
import { FormControl, FormDescription, FormItem, FormLabel } from "@web/components/ui/form"
import { TbLink } from "react-icons/tb"
import { z } from "zod"
import shared from "./shared"


export default createClientTriggerDefinition(shared, {
    tags: ["Basic"],
    icon: TbLink,
    color: "#4b5563",
    renderConfig: ({ workflowId, workflow, updateConfig, onClose }) => {

        const triggerUrl = `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/trigger/request`

        return (
            <TriggerConfig
                aboveSettings={<>
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
                </>}
                settings={
                    <TriggerSettingsForm
                        schema={configSchema}
                        onSubmit={updateConfig}
                        fields={[
                            {
                                key: "waitUntilFinished",
                                defaultValue: workflow?.trigger?.config?.waitUntilFinished ?? false,
                                render: ({ field }) => (
                                    <FormItem className="flex gap-4 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="my-1"
                                            />
                                        </FormControl>
                                        <div>
                                            <FormLabel>
                                                Wait until the workflow finishes running
                                            </FormLabel>
                                            <FormDescription>
                                                If selected, the request will wait until the workflow is finished before responding. Otherwise, the request will return as soon as it's queued.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )
                            }
                        ]}
                        onClose={onClose}
                        closeOnFinishedSubmitting
                    />
                }
            />
        )
    }
})


const configSchema = z.object({
    waitUntilFinished: z.boolean(),
})