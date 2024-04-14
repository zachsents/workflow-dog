import { Card } from "@web/components/ui/card"
import { Progress } from "@web/components/ui/progress"
import { Separator } from "@web/components/ui/separator"
import type { ProjectBillingPeriod, ProjectBillingPlan } from "@web/lib/server/projects"
import { supabaseServer } from "@web/lib/server/supabase"
import { PlanData } from "@web/modules/plans"


export default async function UsageSummaryCard({
    billingPeriod,
    billingPlan,
    projectId,
}: {
    billingPeriod: ProjectBillingPeriod
    billingPlan: ProjectBillingPlan
    projectId: string
}) {

    const supabase = supabaseServer()

    const workflowRunsCount = await supabase
        .rpc("count_workflow_runs_for_project", {
            project_id: projectId,
            after: billingPeriod.start.toISOString(),
        })
        .throwOnError()
        .then(q => q.data || 0)

    const teamMembersCount = await supabase
        .from("users_teams")
        .select("*", { count: "exact", head: true })
        .eq("team_id", projectId)
        .throwOnError()
        .then(q => q.count || 0)

    const planData = PlanData[billingPlan]

    const workflowRunsMax = planData.limits.workflowRuns
    const workflowRunsPercent = Math.min(
        Math.floor(workflowRunsCount / workflowRunsMax * 100),
        100,
    )

    const teamMembersMax = planData.limits.teamMembers
    const teamMembersPercent = Math.min(
        Math.floor(teamMembersCount / teamMembersMax * 100),
        100,
    )

    const fmt = new Intl.NumberFormat()

    return (
        <Card className="p-6 flex-v items-stretch gap-4 shadow-lg h-full">
            <p className="font-bold text-lg">
                Summary
            </p>

            <Separator />

            <div className="flex-v items-stretch gap-2">
                <p className="font-bold">
                    Workflow Runs
                </p>

                <Progress value={workflowRunsPercent} className="h-3" />
                <div className="flex between text-muted-foreground px-2">
                    <p className="flex items-center gap-2">
                        <span className="font-bold">
                            {fmt.format(workflowRunsCount)}
                        </span>
                        <span>/</span>
                        <span>
                            {fmt.format(workflowRunsMax)} runs this month
                        </span>
                    </p>
                    <p>
                        {workflowRunsPercent}%
                    </p>
                </div>

                <p className="px-2 text-muted-foreground text-sm">
                    Resets on {billingPeriod.end.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                    })}
                </p>
            </div>

            <Separator />

            <div className="flex-v items-stretch gap-2">
                <p className="font-bold">
                    Team Members
                </p>

                <Progress value={teamMembersPercent} className="h-3" />
                <p className="flex items-center gap-2 px-2 text-muted-foreground">
                    <span className="font-bold">
                        {fmt.format(teamMembersCount)}
                    </span>
                    <span>/</span>
                    <span>
                        {fmt.format(teamMembersMax)} team members
                    </span>
                </p>
            </div>

            <Separator />
        </Card>
    )
}