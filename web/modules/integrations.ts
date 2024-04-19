import { useQuery } from "@tanstack/react-query"
import { useCurrentProjectId, useCurrentWorkflowId } from "@web/lib/client/hooks"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import "client-only"
import type { NodeServiceRequirement } from "packages/types"
import { useNodeId } from "reactflow"
import { useDefinition } from "./workflow-editor/graph/nodes"


const fieldSelector = (includeSensitive = false) => includeSensitive
    ? "*"
    : "id, service_id, service_user_id, display_name"


export function useIntegrationAccountsForTeam(projectId = useCurrentProjectId(), includeSensitive = false) {
    const supabase = useSupabaseBrowser()
    return useQuery({
        queryFn: async () => supabase
            .from("teams")
            .select(`integration_accounts (${fieldSelector(includeSensitive)})`)
            .eq("id", projectId!)
            .single()
            .throwOnError()
            .then(q => q.data?.integration_accounts),
        queryKey: ["integrationAccountsForTeam", projectId, includeSensitive],
        enabled: !!projectId,
    })
}


export function useIntegrationAccount(integrationAccountId: string | null | undefined, includeSensitive = false) {
    const supabase = useSupabaseBrowser()
    return useQuery({
        queryFn: async () => supabase
            .from("integration_accounts")
            .select(fieldSelector(includeSensitive))
            .eq("id", integrationAccountId!)
            .single()
            .throwOnError()
            .then(q => q.data),
        queryKey: ["integrationAccount", integrationAccountId],
        enabled: !!integrationAccountId,
    })
}


export function useAvailableIntegrationAccounts(serviceId: string, requiredScopes?: (string | string[])[]) {
    const supabase = useSupabaseBrowser()
    const workflowId = useCurrentWorkflowId()

    const query = useQuery({
        queryFn: async () => supabase
            .from("workflows")
            .select("teams (integration_accounts (id, display_name, service_id, scopes:token->scopes))")
            .eq("id", workflowId!)
            .eq("teams.integration_accounts.service_id", serviceId!)
            .single()
            .throwOnError()
            .then(q => q.data?.teams?.integration_accounts),
        queryKey: ["integrationAccountsForWorkflow", workflowId, serviceId],
        enabled: !!workflowId && !!serviceId,
    })

    const accounts = query.data?.filter(
        account => requiredScopes?.every(scope => {
            const accountScopes = (account.scopes as string[] | null) || []

            if (Array.isArray(scope))
                return scope.some(s => accountScopes.includes(s))

            return accountScopes.includes(scope)
        }) ?? true
    ) ?? []

    return [accounts, query] as const
}


/**
 * WIP: This will allow for multiple required services that can
 * be AND'd and OR'd together. Don't have time to implement right
 * now but will be useful for the future.
 */
export function WIP_useAvailableIntegrationAccounts() {
    const nodeId = useNodeId()
    const definition = useDefinition(nodeId)
    const supabase = useSupabaseBrowser()
    const workflowId = useCurrentWorkflowId()

    const relevantServiceIds = definition?.WIP_requiredServices
        ?.flatMap(service => Array.isArray(service)
            ? service.map(s => s.id)
            : service.id)

    const query = useQuery({
        queryFn: async () => supabase
            .from("workflows")
            .select("teams (integration_accounts (id, display_name, service_id, scopes:token->scopes))")
            .eq("id", workflowId!)
            .in("teams.integration_accounts.service_id", relevantServiceIds!)
            .single()
            .throwOnError()
            .then(q => q.data?.teams?.integration_accounts),
        queryKey: ["integrationAccountsForWorkflow", workflowId, relevantServiceIds],
        enabled: !!workflowId && !!relevantServiceIds,
    })

    const linkAccounts = (requirement: NodeServiceRequirement) => ({
        ...requirement,
        accounts: query.data?.filter(account => account.service_id === requirement.id),
    })

    const linkedRequirements = definition?.WIP_requiredServices
        ?.map(requirement => Array.isArray(requirement)
            ? requirement.map(linkAccounts)
            : linkAccounts(requirement))

    return [linkedRequirements, query] as const
}