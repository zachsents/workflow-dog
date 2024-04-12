import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { cn } from "@web/lib/utils"
import { PlanData } from "@web/modules/plans"
import Link from "next/link"


export default async function CurrentPlanCard({ billingPlan }: { billingPlan: string }) {

    const planData = PlanData[billingPlan]

    return (
        <Card className="p-6 flex-v items-stretch gap-4 shadow-lg">
            <div className="flex between gap-4">
                <p className=" font-bold text-lg">
                    Current Plan
                </p>

                <div
                    className={cn(
                        "flex center gap-2 text-xl rounded-xl px-6 py-1",
                        planData.badgeClassName,
                    )}
                >
                    <planData.icon />
                    <p className="uppercase font-bold">
                        {planData.name}
                    </p>
                </div>
            </div>

            <div className="text-muted-foreground">
                <p>
                    Included in this plan:
                </p>
                <ul className="list-disc ml-6">
                    {planData.included.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </div>

            {planData.showBillingButton &&
                <Button variant="secondary" asChild>
                    <Link href="usage/portal">
                        Manage Billing
                    </Link>
                </Button>}
        </Card>
    )
}
