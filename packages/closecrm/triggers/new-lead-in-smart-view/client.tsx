import CloseIcon from "@pkg/closecrm/_components/close-icon"
import { createClientTriggerDefinition } from "@pkg/types"
import { ServiceAccountSelector } from "@web/app/workflows/[workflowId]/edit/_components/action-node/service-account-selector"
import { TriggerConfig, TriggerSettingsForm, defaultValue } from "@web/app/workflows/[workflowId]/edit/_components/trigger-config"
import { FormControl, FormItem, FormLabel } from "@web/components/ui/form"
import { z } from "zod"
import shared from "./shared"
import { Input } from "@web/components/ui/input"


export default createClientTriggerDefinition(shared, {
    tags: ["CloseCRM", "CRM", "Sales"],
    icon: CloseIcon,
    color: "#1463ff",
    renderConfig: ({ workflow, updateConfig, onClose }) => {

        const onSubmit = (data: any) => updateConfig({
            ...data,
            smartViewId: data.smartViewUrl?.match(/save_\w+/)?.[0] || null,
        })

        return (
            <TriggerConfig
                settings={
                    <TriggerSettingsForm
                        schema={configSchema}
                        onSubmit={onSubmit}
                        fields={[
                            {
                                key: "closeAccount",
                                defaultValue: defaultValue(workflow, "closeAccount", null),
                                render: ({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Close Account
                                        </FormLabel>
                                        <FormControl>
                                            <ServiceAccountSelector
                                                selectedAccount={field.value}
                                                setSelectedAccount={field.onChange}
                                                {...requiredService}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )
                            },
                            {
                                key: "smartViewUrl",
                                defaultValue: defaultValue(workflow, "smartViewUrl", ""),
                                render: ({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Smart View URL
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="https://app.close.com/leads/save..."
                                            />
                                        </FormControl>
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
    },
})


const requiredService = {
    serviceDefinitionId: "https://services.workflow.dog/closecrm/close",
}


const configSchema = z.object({
    closeAccount: z.string(),
    smartViewUrl: z.string(),
})