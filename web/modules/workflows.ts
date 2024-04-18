import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"
import { useCurrentWorkflowId } from "@web/lib/client/hooks"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import "client-only"
import { useSearchParams } from "next/navigation"
import { ExternalToast, toast } from "sonner"
import { useUser } from "./auth"
import { useOnDatabaseChange } from "./db"
import { useQueryParam } from "./router"
import { useEditorStore, useEditorStoreApi } from "./workflow-editor/store"
import axios from "axios"


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


export function useRunnableWorkflows(workflowId = useCurrentWorkflowId()) {
    const supabase = useSupabaseBrowser()
    const { data: workflow } = useWorkflow(workflowId)

    return useQuery({
        queryFn: async () => supabase
            .from("workflows")
            .select("id, name")
            .eq("team_id", workflow!.team_id!)
            .eq("trigger->>type", "https://triggers.workflow.dog/basic/manual")
            .throwOnError()
            .then(q => q.data),
        queryKey: ["runnable-workflows", workflow?.team_id],
        enabled: !!workflow?.team_id,
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


export function useInvalidateWorkflowRuns(workflowId = useCurrentWorkflowId()) {
    const queryClient = useQueryClient()
    return useOnDatabaseChange({
        event: "*",
        schema: "public",
        table: "workflow_runs",
        filter: `workflow_id=eq.${workflowId}`,
    }, (newRow, oldRow) => {
        queryClient.invalidateQueries({ queryKey: ["workflow-runs", workflowId] })
        queryClient.invalidateQueries({ queryKey: ["workflow-run", newRow.id || oldRow.id] })
    })
}


/**
 * @deprecated
 * Being phased out in favor of separate useWorkflowRuns and useInvalidateWorkflowRuns
 * so we can invalidate globally but use the query in each needed component
 */
export function useWorkflowRunsRealtime(workflowId = useCurrentWorkflowId()) {
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
    subscribe = true,
    sendNotification = true,
    selectRun = true,
    ...options
}: UseRunWorkflowMutationOptions = {}) {

    const supabase = useSupabaseBrowser()
    const editorStore = useEditorStoreApi()
    const { data: workflow } = useWorkflow(workflowId)

    return useMutation<any, any, any>({
        mutationFn: async (body: any) => {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`)

            try {
                var { data: run } = await axios.post(url.toString(), body)
            } catch (err) {
                const toastOptions: ExternalToast = err.response.data.error.needsUpgrade ? {
                    action: {
                        label: "Upgrade",
                        onClick: () => window.open(`/projects/${workflow?.team_id}/usage/upgrade`),
                    },
                } : {}

                toast.error(err.response.data.error.message, toastOptions)
                return
            }

            const finishPromise = new Promise((resolve, reject) => {
                const channel = supabase
                    .channel(`workflow_run-${run.id}-changes`)
                    .on("postgres_changes", {
                        event: "UPDATE",
                        schema: "public",
                        table: "workflow_runs",
                        filter: `id=eq.${run.id}`,
                    }, (payload) => {
                        if (!["completed", "failed"].includes(payload.new.status))
                            return

                        if (payload.errors?.length > 0)
                            reject(payload.errors)

                        channel.unsubscribe()
                        resolve(payload.new)
                    })
                    .subscribe()
            })

            toast.promise(finishPromise, {
                loading: "Running...",
                success: (finishedRun: any) => `${Object.keys(finishedRun.state.outputs).length} outputs, ${finishedRun.error_count} errors`,
                error: err => err,
                // dismissible: true,
            })

            if (selectRun)
                finishPromise.then(() => editorStore.setState({ selectedRunId: run.id }))
        },
        ...options,
    })
}