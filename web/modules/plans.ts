import { TbBuildingFactory, TbCoffee } from "react-icons/tb"
import { getPlanLimits } from "shared/plans"


export type PlanData = {
    name: string
    icon: React.ComponentType
    included: string[]
    showBillingButton: boolean
    badgeClassName: string
    upgradeButtonClassName?: string
    upsell?: string,
    limits: ReturnType<typeof getPlanLimits>
}

export const PlanData: Record<string, PlanData> = {
    free: {
        name: "Free",
        icon: TbCoffee,
        included: [
            "100 workflow runs per month",
            "Up to 3 team members",
        ],
        showBillingButton: false,
        badgeClassName: "bg-neutral-200 text-neutral-700",
        upsell: "pro",
        limits: getPlanLimits("free"),
    },
    pro: {
        name: "Pro",
        icon: TbBuildingFactory,
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