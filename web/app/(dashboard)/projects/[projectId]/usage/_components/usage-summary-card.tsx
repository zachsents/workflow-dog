import { Card } from "@web/components/ui/card"
import { Progress } from "@web/components/ui/progress"
import { Separator } from "@web/components/ui/separator"


export default async function UsageSummaryCard() {

    const workflowRunsUsage = 33
    const workflowRunsMax = 100
    const workflowRunsPercent = Math.round(workflowRunsUsage / workflowRunsMax * 100)

    const teamMembersUsage = 2
    const teamMembersMax = 3
    const teamMembersPercent = Math.round(teamMembersUsage / teamMembersMax * 100)

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
                        <span className="font-bold">{workflowRunsUsage}</span>
                        <span>/</span>
                        <span>{workflowRunsMax} runs this month</span>
                    </p>
                    <p>
                        {workflowRunsPercent}%
                    </p>
                </div>

                <p className="px-2 text-muted-foreground">
                    Resets in 10 days
                </p>
            </div>

            <Separator />

            <div className="flex-v items-stretch gap-2">
                <p className="font-bold">
                    Team Members
                </p>

                <Progress value={teamMembersPercent} className="h-3" />
                <p className="flex items-center gap-2 px-2 text-muted-foreground">
                    <span className="font-bold">{teamMembersUsage}</span>
                    <span>/</span>
                    <span>{teamMembersMax} team members</span>
                </p>
            </div>

            <Separator />
        </Card>
    )
}