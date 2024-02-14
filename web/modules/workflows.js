import { useMutation, useQuery } from "@tanstack/react-query"
import { useUser } from "./auth"
import { useQueryParam } from "./router"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useEditorStore } from "./workflow-editor/store"


export function useWorkflowIdFromUrl(skip) {
    const [workflowId] = useQueryParam("workflowId")
    return skip || workflowId
}


export function useWorkflowsForTeam(teamId, selectKeys = ["*"]) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data: { workflows } } = await supabase
                .from("teams")
                .select(`workflows (${selectKeys.join(",")})`)
                .eq("id", teamId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(workflows)
        },
        queryKey: ["workflowsForTeam", teamId, selectKeys],
        enabled: !!teamId,
    })
}


export function useWorkflow(workflowId) {

    workflowId = useWorkflowIdFromUrl(workflowId)

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflows")
                .select("*")
                .eq("id", workflowId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["workflow", workflowId],
        enabled: !!workflowId,
    })
}


/**
 * TO DO: change to API endpoint so we can:
 * - create associated version, trigger, etc.
 * - do property validation w/ something like zod/joi
 * 
 * Also need to figure out how to make default select from metadata table
 */
export function useCreateWorkflow() {

    const { data: user } = useUser()
    const [teamId] = useQueryParam("team")

    return useMutation({
        mutationFn: async ({ name, trigger }) => {
            if (!user?.id || !teamId)
                return console.warn("User or team not set")

            const { data } = await supabase
                .from("workflows")
                .insert({
                    name,
                    team_id: teamId,
                    trigger: { type: trigger },
                    creator: user.id,
                })
                .select("id")
                .single()
                .throwOnError()
            return deepCamelCase(data)
        }
    })
}


export function useWorkflowRuns(workflowId) {

    workflowId = useWorkflowIdFromUrl(workflowId)

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflow_runs")
                .select("id, count, created_at, status, has_errors, error_count")
                .eq("workflow_id", workflowId)
                .order("created_at", { ascending: false })
                .limit(100)
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["workflow-runs", workflowId],
        enabled: !!workflowId,
    })
}


export function useWorkflowRun(runId) {
    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflow_runs")
                .select("*")
                .eq("id", runId)
                .single()
                .throwOnError()
            return deepCamelCase(data, { excludeDashedKeys: true })
        },
        queryKey: ["workflow-run", runId],
        enabled: !!runId,
    })
}


export function useSelectedWorkflowRun() {
    const selectedRunId = useEditorStore(s => s.selectedRunId)
    return useWorkflowRun(selectedRunId)
}