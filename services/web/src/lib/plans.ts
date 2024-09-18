import { IconBuildingFactory, IconCoffee, IconFeather, IconPencilBolt } from "@tabler/icons-react"
import type { BillingPlan } from "core/db"
import { getPlanData } from "core/plans"


const clientPlanData: Record<BillingPlan, ClientPlanData> = {
    free: {
        icon: IconCoffee,
        badgeClassName: "bg-gray-300 text-gray-800",
        upsellsTo: "basic",
    },
    basic: {
        icon: IconFeather,
        badgeClassName: "bg-yellow-300 text-yellow-800",
        upsellsTo: "pro",
    },
    pro: {
        icon: IconBuildingFactory,
        badgeClassName: "bg-primary text-primary-foreground",
        upsellsTo: "custom",
    },
    custom: {
        icon: IconPencilBolt,
        badgeClassName: "bg-neutral-800 text-neutral-100",
        emailSubject: "Custom plan request",
    },
}

export function getClientPlanData(plan: BillingPlan) {
    return {
        ...clientPlanData[plan],
        ...getPlanData(plan),
    }
}

type ClientPlanData = {
    icon: React.ComponentType
    badgeClassName: string
} & ({
    upsellsTo: BillingPlan,
} | {
    emailSubject: string
})