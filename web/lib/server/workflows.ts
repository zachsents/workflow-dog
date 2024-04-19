import "server-only"
import { TypedSupabaseClient } from "../types/supabase"


export async function waitForRunToFinish(supabase: TypedSupabaseClient, runId: string): Promise<any> {
    return new Promise((resolve, reject) => {
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

                if (payload.errors?.length > 0)
                    reject(payload.errors)

                channel.unsubscribe()
                resolve(payload.new)
            })
            .subscribe()
    })
}
