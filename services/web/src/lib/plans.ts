import { IconBuildingFactory, IconCoffee, IconFeather, IconPencilBolt } from "@tabler/icons-react"
import type { BillingPlan } from "core/db"
import { getPlanData } from "core/plans"


export type PlanData = {
    name: string
    icon: React.ComponentType
    included: string[]
    badgeClassName: string
    upgradeButtonClassName?: string
    upsell?: BillingPlan,
    emailSubject?: string
} & ReturnType<typeof getPlanData>

const planData: Record<BillingPlan, PlanData> = {
    free: {
        name: "Free",
        icon: IconCoffee,
        included: [
            "100 workflow runs per month",
            "No additional team members",
        ],
        badgeClassName: "bg-gray-300 text-gray-800",
        upsell: "basic",
        ...getPlanData("free"),
    },
    basic: {
        name: "Basic",
        icon: IconFeather,
        included: [
            "1000 workflow runs per month",
            "Up to 3 team members",
        ],
        badgeClassName: "bg-yellow-300 text-yellow-800",
        upsell: "pro",
        ...getPlanData("basic"),
    },
    pro: {
        name: "Business",
        icon: IconBuildingFactory,
        included: [
            "10,000 workflow runs per month",
            "Up to 20 team members",
        ],
        badgeClassName: "bg-primary text-primary-foreground",
        upgradeButtonClassName: "bg-neutral-800",
        upsell: "custom",
        ...getPlanData("pro"),
    },
    custom: {
        name: "Custom",
        icon: IconPencilBolt,
        included: [
            "Custom pricing",
            "Workflow runs charged by usage",
            "Unlimited team members",
        ],
        badgeClassName: "bg-neutral-800 text-neutral-100",
        emailSubject: "Custom plan request",
        ...getPlanData("custom"),
    },
}

export function getPlanInfo(plan: BillingPlan) {
    return planData[plan]
}
