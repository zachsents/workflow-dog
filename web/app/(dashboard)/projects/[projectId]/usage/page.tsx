import { supabaseServer } from "@web/lib/server/supabase"
import CurrentPlanCard from "./_components/current-plan-card"
import UpgradePlanCard from "./_components/upgrade-plan-card"
import UsageByWorkflow from "./_components/usage-by-workflow"
import UsageSummaryCard from "./_components/usage-summary-card"


export default async function UsagePage({
    params: { projectId },
}: {
    params: { projectId: string }
}) {

    const supabase = supabaseServer()
    const projectQuery = await supabase
        .from("teams")
        .select("billing_plan")
        .eq("id", projectId)
        .single()
        .throwOnError()

    const billingPlan = projectQuery.data?.billing_plan || "free"

    return (<>
        <div className="flex justify-between gap-10">
            <h1 className="text-2xl font-bold">
                Usage
            </h1>

            {/* <CreateWorkflow /> */}
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="row-span-2">
                <UsageSummaryCard />
            </div>
            <div>
                <CurrentPlanCard billingPlan={billingPlan} />
            </div>
            <div>
                <UpgradePlanCard billingPlan={billingPlan} />
            </div>

            <div className="col-span-full">
                <UsageByWorkflow />
            </div>
        </div>
        {/* <WorkflowsTable projectId={projectId} /> */}
    </>)
}
