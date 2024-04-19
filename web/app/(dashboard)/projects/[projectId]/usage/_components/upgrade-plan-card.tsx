import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import type { ProjectBillingPlan } from "@web/lib/server/projects"
import { PlanData } from "@web/modules/plans"
import Link from "next/link"
import { TbConfetti, TbMail } from "react-icons/tb"


export default function UpgradePlanCard({ billingPlan }: { billingPlan: ProjectBillingPlan }) {

    const planData = PlanData[PlanData[billingPlan].upsell!]

    return (
        <Card className="p-6 flex-v items-stretch gap-4 shadow-lg">
            <p className="font-bold text-xl">
                Need some more juice?
            </p>

            {planData
                ? <>
                    <div className="text-muted-foreground">
                        <p>
                            You could enjoy:
                        </p>
                        <ul className="list-disc ml-6">
                            {planData.included.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <Button size="lg" asChild className="outline outline-amber-400">
                        <Link href="usage/upgrade" className="text-md flex center gap-2">
                            <TbConfetti />
                            Upgrade to {planData.name}
                        </Link>
                    </Button>
                </>
                : <>
                    <p className="text-muted-foreground">
                        You're already on the highest plan we offer!
                    </p>
                    <Button size="lg" asChild className="outline outline-amber-400">
                        <a
                            href="mailto:info@workflow.dog?subject=We%20need%20a%20custom%20plan&body=Tell%20us%20about%20your%20use-cases."
                            className="flex center gap-2"
                        >
                            <TbMail />
                            Reach out for a custom plan
                        </a>
                    </Button>
                </>}
        </Card>
    )
}