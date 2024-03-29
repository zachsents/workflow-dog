import { supabaseServer } from "@web/lib/server/supabase"
import WorkflowsTableClient from "./client"
import { Suspense } from "react"
import { Skeleton } from "@ui/skeleton"


export default function WorkflowsTable({ projectId }: { projectId: string }) {
    return (
        <Suspense fallback={<Skeleton withLoader className="w-full h-40" />}>
            <WorkflowsTableLoader projectId={projectId} />
        </Suspense>
    )
}


async function WorkflowsTableLoader({ projectId }: { projectId: string }) {

    const supabase = supabaseServer()

    const query = await supabase
        .from("workflows")
        .select("id, name, created_at, is_enabled, trigger_type:trigger->type")
        .eq("team_id", projectId)
        .throwOnError()

    const workflows = query.data ?? []
    workflows.forEach(wf => {
        wf.created_at = new Date(wf.created_at!).toLocaleDateString(undefined, {
            dateStyle: "medium",
        })
    })

    return (
        <WorkflowsTableClient workflows={workflows} />
    )
}