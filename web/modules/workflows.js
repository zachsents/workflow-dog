import { useMutation, useQuery } from "@tanstack/react-query"
import { useUser } from "./auth"
import { useQueryParam } from "./router"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useEditorStore, useEditorStoreApi } from "./workflow-editor/store"
import { useNotifications } from "./notifications"


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


export function useWorkflowRuns(workflowId, selectKeys = ["*"]) {

    workflowId = useWorkflowIdFromUrl(workflowId)

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflow_runs")
                .select(selectKeys.join(","))
                .eq("workflow_id", workflowId)
                .order("created_at", { ascending: false })
                .limit(50)
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
            return deepCamelCase(data, { excludeDashedKeys: true, excludeColonKeys: true })
        },
        queryKey: ["workflow-run", runId],
        enabled: !!runId,
    })
}


export function useSelectedWorkflowRun() {
    const selectedRunId = useEditorStore(s => s.selectedRunId)
    return useWorkflowRun(selectedRunId)
}


/**
 * @param {string} workflowId
 * @param {{ subscribe: boolean, sendNotification: boolean, selectRun: boolean } & import("@tanstack/react-query").UseMutationOptions} options
 */
export function useRunWorkflowMutation(workflowId, {
    subscribe = false,
    sendNotification = true,
    selectRun = true,
    ...options
} = {}) {
    workflowId = useWorkflowIdFromUrl(workflowId)
    const { notify } = useNotifications()
    const editorStore = useEditorStoreApi()

    return useMutation({
        mutationFn: async (body) => {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`)

            if (subscribe)
                url.searchParams.set("subscribe", "true")

            const run = await fetch(url.toString(), {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }).then(res => res.ok ? res.json() : Promise.reject(res.text()))

            if (selectRun)
                editorStore.setState({ selectedRunId: run.id })

            if (sendNotification)
                notify({
                    title: `Run #${run.count} finished!`,
                    message: `${Object.keys(run.state.outputs).length} outputs, ${run.error_count} errors`,
                    classNames: { icon: run.has_errors ? "bg-danger-500" : "bg-success-500" }
                })
        },
        ...options,
    })
}