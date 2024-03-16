import { UseMutationOptions, useMutation, useQuery } from "@tanstack/react-query"
import type { Camel, Workflow, WorkflowRun } from "shared/types"
import { useUser } from "./auth"
import { useRealtimeQuery } from "./db"
import { useNotifications } from "./notifications"
import { useQueryParam } from "./router"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useEditorStore, useEditorStoreApi } from "./workflow-editor/store"



export function useWorkflowIdFromUrl(skip?: string | undefined) {
    const [workflowId] = useQueryParam("workflowId")
    return skip || workflowId
}


export function useWorkflowsForTeam(teamId: string | undefined, selectKeys = ["*"]) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflows")
                .select(selectKeys.join(","))
                .eq("team_id", teamId)
                .throwOnError()
            return deepCamelCase(data) as Camel<Workflow>[]
        },
        queryKey: ["workflowsForTeam", teamId, selectKeys],
        enabled: !!teamId,
    })
}


export function useWorkflow(workflowId?: string, selectKeys = ["*"]) {

    workflowId = useWorkflowIdFromUrl(workflowId)

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflows")
                .select(selectKeys.join(","))
                .eq("id", workflowId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data) as Camel<Workflow>
        },
        queryKey: ["workflow", workflowId, selectKeys],
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
        mutationFn: async ({ name, trigger }: { name: string, trigger: string }) => {
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
            return data as { id: string }
        }
    })
}





export function useWorkflowRuns(workflowId?: string, selectKeys = ["*"]) {

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
            return deepCamelCase(data) as Camel<WorkflowRun>[]
        },
        queryKey: ["workflow-runs", workflowId, selectKeys],
        enabled: !!workflowId,
    })
}


export function useWorkflowRunsRealtime(workflowId?: string, selectKeys = ["*"]) {

    workflowId = useWorkflowIdFromUrl(workflowId)

    return useRealtimeQuery({
        schema: "public",
        table: "workflow_runs",
        event: "*",
        filter: `workflow_id=eq.${workflowId}`,
    }, {
        queryFn: async () => {
            const { data } = await supabase
                .from("workflow_runs")
                .select(selectKeys.join(","))
                .eq("workflow_id", workflowId)
                .order("created_at", { ascending: false })
                .limit(50)
                .throwOnError()
            return deepCamelCase(data) as Camel<WorkflowRun>[]
        },
        queryKey: ["realtime", "workflow-runs", workflowId, selectKeys],
        enabled: !!workflowId,
    })
}


export function useWorkflowRun(runId: string, selectKeys = ["*"]) {
    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflow_runs")
                .select(selectKeys.join(","))
                .eq("id", runId)
                .single()
                .throwOnError()
            return deepCamelCase(data, { excludeDashedKeys: true, excludeColonKeys: true }) as Camel<WorkflowRun>
        },
        queryKey: ["workflow-run", runId, selectKeys],
        enabled: !!runId,
    })
}


export function useSelectedWorkflowRun() {
    const selectedRunId = useEditorStore(s => s.selectedRunId) as string
    return useWorkflowRun(selectedRunId)
}


export function useRunWorkflowMutation(workflowId?: string, {
    subscribe = false,
    sendNotification = true,
    selectRun = true,
    ...options
}: {
    subscribe?: boolean
    sendNotification?: boolean
    selectRun?: boolean
} & UseMutationOptions = {}) {

    workflowId = useWorkflowIdFromUrl(workflowId)
    const { notify } = useNotifications()
    const editorStore = useEditorStoreApi()

    return useMutation({
        mutationFn: async (body) => {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`)

            if (subscribe)
                url.searchParams.set("subscribe", "true")

            const run = await fetch(url.toString(), {
                method: "POST",
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