import { createClientTriggerDefinition } from "@pkg/types"
import { ServiceAccountSelector } from "@web/app/workflows/[workflowId]/edit/_components/action-node/service-account-selector"
import { TriggerConfig, TriggerSettingsForm, defaultValue } from "@web/app/workflows/[workflowId]/edit/_components/trigger-config"
import { FormControl, FormItem, FormLabel } from "@web/components/ui/form"
import { TbBrandGmail } from "react-icons/tb"
import { z } from "zod"
import shared from "./shared"
import GoogleConsentWarning from "@web/components/google-consent-warning"


export default createClientTriggerDefinition(shared, {
    tags: ["Gmail", "Email"],
    icon: TbBrandGmail,
    color: "#ea4335",
    renderConfig: ({ workflow, updateConfig, onClose }) => {
        return (
            <TriggerConfig
                aboveSettings={<GoogleConsentWarning />}
                settings={
                    <TriggerSettingsForm
                        schema={configSchema}
                        onSubmit={updateConfig}
                        fields={[
                            {
                                key: "googleAccount",
                                defaultValue: defaultValue(workflow, "googleAccount", null),
                                render: ({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Google Account
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
    serviceDefinitionId: "https://services.workflow.dog/google/google-oauth",
    requiredScopes: ["https://www.googleapis.com/auth/gmail.modify"],
}


const configSchema = z.object({
    googleAccount: z.string().nullable(),
})