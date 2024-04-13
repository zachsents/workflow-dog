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
    const workflowRunsQuery = await supabase
        .from("workflow_runs")
        .select("workflow_id, workflows ( name, team_id )")
        .eq("workflows.team_id", projectId)
        .gt("started_at", billingPeriod.start.toISOString())
        .throwOnError()

    const countMap: Record<string, { count: number, name: string, id: string }> =
        workflowRunsQuery.data?.reduce((acc, entry) => {
            acc[entry.workflow_id] ??= {
                count: 0,
                name: entry.workflows?.name || "",
                id: entry.workflow_id,
            }
            acc[entry.workflow_id].count++
            return acc
        }, {}) || {}

    const barGraphRows = Object.values(countMap)
        .sort((a, b) => b.count - a.count)

    const maxCount = Math.max(
        barGraphRows.reduce((max, row) => Math.max(max, row.count), 0),
        10,
    )

    const fmt = new Intl.NumberFormat()

    return (
        <Card className="p-6 flex-v items-stretch gap-8 shadow-lg h-full">
            <p className="font-bold text-lg">
                Usage by Workflow
            </p>

            <div className="grid grid-cols-[220px_auto] gap-x-8 items-center">
                {barGraphRows.map((row, i) =>
                    <Fragment key={row.id}>
                        <div className="border-r py-1">
                            <p className="line-clamp-2">
                                {row.name || "Deleted"}
                            </p>
                            <p className="text-muted-foreground text-sm text-nowrap">
                                {fmt.format(row.count)} runs
                            </p>
                        </div>
                        <div
                            className="h-6 bg-violet-600 rounded-sm"
                            style={{
                                width: `${Math.max(Math.floor(row.count / maxCount * 100), 1)}%`,
                                opacity: Math.max(0.25, 1 - i * 0.15),
                            }}
                        />
                    </Fragment>
                )}
            </div>
        </Card>
    )
}