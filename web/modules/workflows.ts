import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { useCurrentWorkflowId, useOnDatabaseChange } from "@web/lib/client/hooks"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import { trpc } from "@web/lib/client/trpc"
import axios from "axios"
import "client-only"
import { ExternalToast, toast } from "sonner"
import { useEditorStore, useEditorStoreApi } from "./workflow-editor/store"


export function useWorkflow(workflowId = useCurrentWorkflowId()) {
    return trpc.workflows.byId.useQuery({
        id: workflowId,
    })
}


export function useInvalidateWorkflowRuns(workflowId = useCurrentWorkflowId()) {
    const utils = trpc.useUtils()
    return useOnDatabaseChange({
        event: "*",
        schema: "public",
        table: "workflow_runs",
        filter: `workflow_id=eq.${workflowId}`,
    }, (newRow, oldRow) => {
        utils.workflows.runs.list.invalidate()
        utils.workflows.runs.byId.invalidate({ id: newRow.id || oldRow.id })
    })
}

export function useSelectedWorkflowRun() {
    const selectedRunId = useEditorStore(s => s.selectedRunId)
    return trpc.workflows.runs.byId.useQuery({
        id: selectedRunId!,
    }, {
        enabled: !!selectedRunId,
    })
}


interface UseRunWorkflowMutationOptions extends UseMutationOptions {
    sendNotification?: boolean
    selectRun?: boolean
}

export function useRunWorkflowMutation(workflowId = useCurrentWorkflowId(), {
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
                var { data: { id: runId } } = await axios.post(url.toString(), body)
            } catch (err) {
                const toastOptions: ExternalToast = err.response.data.error.needsUpgrade ? {
                    action: {
                        label: "Upgrade",
                        onClick: () => window.open(`/projects/${workflow?.team_id}/billing/upgrade`),
                    },
                } : {}

                toast.error(err.response.data.error.message, toastOptions)
                return
            }

            const finishPromise = new Promise((resolve, reject) => {
                const channel = supabase
                    .channel(`workflow_run-${runId}-changes`)
                    .on("postgres_changes", {
                        event: "UPDATE",
                        schema: "public",
                        table: "workflow_runs",
                        filter: `id=eq.${runId}`,
                    }, (payload) => {
                        if (!["completed", "failed"].includes(payload.new.status))
                            return

                        const errors = (payload.errors || [])
                            .filter(err => !err.includes("413"))

                        if (errors.length > 0)
                            reject(payload.errors.join("\n"))

                        channel.unsubscribe()
                        resolve(payload.new)
                    })
                    .subscribe()
            })

            toast.promise(finishPromise, {
                loading: "Running...",
                success: (finishedRun: any) => finishedRun.has_errors
                    ? `Finished with ${finishedRun.error_count} error(s)`
                    : "Finished!",
                error: err => err,
                // dismissible: true,
            })

            if (selectRun)
                finishPromise.then(() => editorStore.setState({ selectedRunId: runId }))
        },
        ...options,
    })
}