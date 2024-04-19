import "server-only"
import { TypedSupabaseClient } from "../types/supabase"


export async function waitForRunToFinish(supabase: TypedSupabaseClient, runId: string) {

    const { needsToRefetch, record } = await new Promise<{
        needsToRefetch: boolean,
        record: any,
    }>((resolve, reject) => {
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

                const needsToRefetch = payload.errors?.some(err => err.includes("413"))

                const errors = (payload.errors || [])
                    .filter(err => !err.includes("413"))

                if (errors.length > 0)
                    reject(payload.errors.join("\n"))

                channel.unsubscribe()
                resolve({
                    needsToRefetch,
                    record: payload.new,
                })
            })
            .subscribe()
    })

    if (!needsToRefetch)
        return record

    return await supabase
        .from("workflow_runs")
        .select("*")
        .eq("id", runId)
        .single()
        .throwOnError()
        .then(q => q.data)
}
