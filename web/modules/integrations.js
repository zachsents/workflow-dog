import { useQuery } from "@tanstack/react-query"
import { useNodeId } from "reactflow"
import { useQueryParam } from "./router"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useDefinition } from "./workflow-editor/graph/nodes"
import { useWorkflowIdFromUrl } from "./workflows"


export function useIntegrationAccountsForTeam(teamId, selectKeys = ["*"]) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("teams")
                .select(`integration_accounts (${selectKeys.join(",")})`)
                .eq("id", teamId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data.integration_accounts)
        },
        queryKey: ["integrationAccountsForTeam", teamId, selectKeys],
        enabled: !!teamId,
    })
}


export function useIntegrationAccount(integrationAccountId) {
    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("integration_accounts")
                .select("*")
                .eq("id", integrationAccountId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["integrationAccount", integrationAccountId],
        enabled: !!integrationAccountId,
    })
}


export function useNodeIntegrationAccount() {
    const nodeId = useNodeId()
    const definition = useDefinition(nodeId)

    const workflowId = useWorkflowIdFromUrl()

    const availableAccountsQuery = useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflows")
                .select("teams (integration_accounts (id, display_name, service_name, service_user_id, scopes))")
                .eq("id", workflowId)
                .eq("teams.integration_accounts.service_name", definition.requiredIntegration.service)

            return deepCamelCase(data.flatMap(item => item.teams.integration_accounts))
        },
        queryKey: ["integrationAccountsForWorkflow", workflowId, definition.requiredIntegration.service],
        enabled: !!workflowId && !!definition.requiredIntegration?.service,
    })

    return {
        available: availableAccountsQuery.data,
        isPending: availableAccountsQuery.isLoading,
    }
}