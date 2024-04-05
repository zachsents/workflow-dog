import { type UseMutationOptions, useMutation, useQuery } from "@tanstack/react-query"
import { useCurrentWorkflowId } from "@web/lib/client/hooks"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import "client-only"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "./auth"
import { useInvalidateOnDatabaseChange } from "./db"
import { useQueryParam } from "./router"
import { useEditorStore, useEditorStoreApi } from "./workflow-editor/store"


export function useWorkflowIdFromUrl(skip?: string | undefined) {
    const [workflowId] = useQueryParam("workflowId")
    return skip || workflowId
}


export function useWorkflow(workflowId = useCurrentWorkflowId()) {
    const supabase = useSupabaseBrowser()
    return useQuery({
        queryFn: async () => supabase
            .from("workflows")
            .select("*")
            .eq("id", workflowId!)
            .single()
            .throwOnError()
            .then(q => q.data),
        queryKey: ["workflow", workflowId],
        enabled: !!workflowId,
    })
}


interface CreateWorkflowOptions {
    name: string
    trigger: string
}

/**
 * TODO: change to API endpoint so we can:
 * - create associated version, trigger, etc.
 * - do property validation w/ something like zod/joi
 * 
 * Also need to figure out how to make default select from metadata table
 */
export function useCreateWorkflow() {

    const { data: user } = useUser()
    const teamId = useSearchParams()?.get("team")

    const supabase = useSupabaseBrowser()

    return useMutation({
        mutationFn: async ({ name, trigger }: CreateWorkflowOptions) => {
            if (!user?.id) return void console.warn("User not set")
            if (!teamId) return void console.warn("Team not set")

            return supabase
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
                .then(q => q.data)
        },
    })
}


export function useWorkflowRuns(workflowId = useCurrentWorkflowId()) {
    const supabase = useSupabaseBrowser()
    return useQuery({
        queryFn: async () => supabase
            .from("workflow_runs")
            .select("*")
            .eq("workflow_id", workflowId!)
            .order("created_at", { ascending: false })
            .limit(50)
            .throwOnError()
            .then(q => q.data),
        queryKey: ["workflow-runs", workflowId],
        enabled: !!workflowId,
    })
}


export function useWorkflowRunsRealtime(workflowId = useCurrentWorkflowId()) {
    const supabase = useSupabaseBrowser()

    useInvalidateOnDatabaseChange({
        event: "*",
        schema: "public",
        table: "workflow_runs",
        filter: `workflow_id=eq.${workflowId}`,
    }, ["workflow-runs", workflowId])

    return useQuery({
        queryFn: async () => supabase
            .from("workflow_runs")
            .select("*")
            .eq("workflow_id", workflowId!)
            .order("created_at", { ascending: false })
            .limit(50)
            .throwOnError()
            .then(q => q.data),
        queryKey: ["workflow-runs", workflowId],
        enabled: !!workflowId,
    })
}


export function useWorkflowRun(runId: string) {
    const supabase = useSupabaseBrowser()
    return useQuery({
        queryFn: async () => supabase
            .from("workflow_runs")
            .select("*")
            .eq("id", runId)
            .single()
            .throwOnError()
            .then(q => q.data),
        queryKey: ["workflow-run", runId],
        enabled: !!runId,
    })
}


export function useSelectedWorkflowRun() {
    const selectedRunId = useEditorStore(s => s.selectedRunId)
    return useWorkflowRun(selectedRunId!)
}


interface UseRunWorkflowMutationOptions extends UseMutationOptions {
    subscribe?: boolean
    sendNotification?: boolean
    selectRun?: boolean
}

export function useRunWorkflowMutation(workflowId = useCurrentWorkflowId(), {
    subscribe = false,
    sendNotification = true,
    selectRun = true,
    ...options
}: UseRunWorkflowMutationOptions = {}) {

    const editorStore = useEditorStoreApi()

    return useMutation<any, any, any>({
        mutationFn: async (body: any) => {
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

            if (sendNotification) {
                const sendNotification: (typeof toast.success) = run.has_errors
                    ? toast.warning.bind(toast)
                    : toast.success.bind(toast)

                sendNotification(`Run #${run.count} started!`, {
                    description: `${Object.keys(run.state.outputs).length} outputs, ${run.error_count} errors`,
                })
            }
        },
        ...options,
    })
}