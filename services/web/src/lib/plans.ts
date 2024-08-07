import { IconBuildingFactory, IconCoffee } from "@tabler/icons-react"
import type { BillingPlan } from "core/db"
import { getPlanLimits } from "core/plans"


export type PlanData = {
    name: string
    icon: React.ComponentType
    included: string[]
    showBillingButton: boolean
    badgeClassName: string
    upgradeButtonClassName?: string
    upsell?: BillingPlan,
    limits: ReturnType<typeof getPlanLimits>
}

export const PlanData: {
    [k in BillingPlan | "free"]: PlanData
} = {
    free: {
        name: "Free",
        icon: IconCoffee,
        included: [
            "100 workflow runs per month",
            "Up to 3 team members",
        ],
        showBillingButton: false,
        badgeClassName: "bg-gray-300 text-gray-800",
        upsell: "pro",
        limits: getPlanLimits("free"),
    },
    pro: {
        name: "Pro",
        icon: IconBuildingFactory,
        included: [
            "10,000 workflow runs per month",
            "Up to 20 team members",
        ],
        showBillingButton: true,
        badgeClassName: "bg-primary text-primary-foreground",
        upgradeButtonClassName: "bg-neutral-800",
        limits: getPlanLimits("pro"),
    },
}

export function getPlanData(plan: BillingPlanArg) {
    return PlanData[plan || "free"]
}

export type BillingPlanArg = BillingPlan | "free" | null