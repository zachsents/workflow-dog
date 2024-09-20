import type { BillingPlan } from "./db"


export const planData: Record<BillingPlan, BillingPlanData> = {
    free: {
        name: "Free",
        description: "Try out automating with WorkflowDog.",
        monthlyPrice: 0,
        teamMemberLimit: 1,
        workflowRunLimit: 100,
        features: [
            "100 workflow runs per month",
            "No additional team members",
        ],
        syncToStripe: true,
    },
    basic: {
        name: "Basic",
        description: "Tackle basic automations for small teams.",
        monthlyPrice: 2700,
        yearlyPrice: 26700,
        teamMemberLimit: 3,
        workflowRunLimit: 1000,
        features: [
            "1,000 workflow runs per month",
            "Up to 3 team members",
        ],
        syncToStripe: true,
    },
    pro: {
        name: "Business",
        description: "For larger teams automating tons of workflows.",
        monthlyPrice: 9700,
        yearlyPrice: 92700,
        teamMemberLimit: 20,
        workflowRunLimit: 10000,
        features: [
            "10,000 workflow runs per month",
            "Up to 20 team members",
        ],
        syncToStripe: true,
    },
    custom: {
        name: "Custom",
        description: "Custom plan with usage pricing.",
        syncToStripe: false,
        teamMemberLimit: Infinity,
        workflowRunLimit: Infinity,
        features: [
            "Custom pricing",
            "Workflow runs charged by usage",
            "Unlimited team members",
        ],
    },
}

export function getPlanData(plan: BillingPlan) {
    return planData[plan]
}

export type BillingPlanData = {
    teamMemberLimit: number
    workflowRunLimit: number
    name: string
    description: string
    features: string[]
} & ({
    syncToStripe: true
    monthlyPrice: number
    yearlyPrice?: number
} | {
    syncToStripe: false
})