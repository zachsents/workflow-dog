import { Card } from "@web/components/ui/card"
import type { ProjectBillingPeriod } from "@web/lib/server/projects"
import { supabaseServer } from "@web/lib/server/supabase"
import { Fragment } from "react"


export default async function UsageByWorkflow({
    projectId,
    billingPeriod,
}: {
    projectId: string
    billingPeriod: ProjectBillingPeriod
}) {

    const supabase = supabaseServer()

    const countRows = await supabase
        .rpc("count_workflow_runs_by_workflow_for_project", {
            project_id: projectId,
            after: billingPeriod.start.toISOString(),
        })
        .throwOnError()
        .then(q => q.data || [])

    const maxCount = Math.max(
        countRows.reduce((max, row) => Math.max(max, row.run_count), 0),
        10,
    )

    const fmt = new Intl.NumberFormat()

    return (
        <Card className="p-6 flex-v items-stretch gap-8 shadow-lg h-full">
            <p className="font-bold text-lg">
                Usage by Workflow
            </p>

            {countRows.length > 0
                ? <div className="grid grid-cols-[220px_auto] gap-x-8 items-center">
                    {countRows.map((row, i) =>
                        <Fragment key={row.workflow_id}>
                            <div className="border-r py-1">
                                <p className="line-clamp-2">
                                    {row.workflow_name || "Deleted"}
                                </p>
                                <p className="text-muted-foreground text-sm text-nowrap">
                                    {fmt.format(row.run_count)} runs
                                </p>
                            </div>
                            <div
                                className="h-6 bg-violet-600 rounded-sm"
                                style={{
                                    width: `${Math.max(Math.floor(row.run_count / maxCount * 100), 1)}%`,
                                    opacity: Math.max(0.25, 1 - i * 0.15),
                                }}
                            />
                        </Fragment>
                    )}
                </div>
                : <p className="text-sm text-muted-foreground text-center pb-4">
                    No runs yet since {billingPeriod.start.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                    })}
                </p>}
        </Card>
    )
}