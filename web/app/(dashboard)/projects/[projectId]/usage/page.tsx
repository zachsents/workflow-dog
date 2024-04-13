import { getProjectBilling, isCurrentUserOwner } from "@web/lib/server/projects"
import CurrentPlanCard from "./_components/current-plan-card"
import UpgradePlanCard from "./_components/upgrade-plan-card"
import UsageByWorkflow from "./_components/usage-by-workflow"
import UsageSummaryCard from "./_components/usage-summary-card"
import { cn } from "@web/lib/utils"


export default async function UsagePage({
    params: { projectId },
}: {
    params: { projectId: string }
}) {
    const billing = await getProjectBilling(projectId)
    const isOwner = await isCurrentUserOwner(projectId)

    return (<>
        <h1 className="text-2xl font-bold">
            Usage
        </h1>

        <div className="grid grid-cols-2 gap-6">
            <div className={cn(
                isOwner ? "row-span-2" : "col-span-full"
            )}>
                <UsageSummaryCard
                    billingPlan={billing.plan}
                    billingPeriod={billing.period}
                    projectId={projectId}
                />
            </div>
            {isOwner && <>
                <div>
                    <CurrentPlanCard billingPlan={billing.plan} />
                </div>
                <div>
                    <UpgradePlanCard billingPlan={billing.plan} />
                </div>
            </>}

            <div className="col-span-full">
                <UsageByWorkflow
                    projectId={projectId}
                    billingPeriod={billing.period}
                />
            </div>
        </div>
    </>)
}
