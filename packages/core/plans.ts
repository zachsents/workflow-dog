import type { BillingPlan } from "./db"

const planData: Record<BillingPlan, {
    teamMemberLimit: number
    workflowRunLimit: number
    // monthlyPriceId: string
    // yearlyPriceId: string
}> = {
    free: {
        teamMemberLimit: 1,
        workflowRunLimit: 100,
        // monthlyPriceId: useEnvVar("STRIPE_FREE_PRICE_ID"),
        // yearlyPriceId: useEnvVar("STRIPE_FREE_PRICE_ID"),
    },
    basic: {
        teamMemberLimit: 3,
        workflowRunLimit: 1000,
        // monthlyPriceId: useEnvVar("STRIPE_BASIC_MONTHLY_PRICE_ID"),
        // yearlyPriceId: useEnvVar("STRIPE_BASIC_YEARLY_PRICE_ID"),
    },
    pro: {
        teamMemberLimit: 20,
        workflowRunLimit: 10000,
        // monthlyPriceId: useEnvVar("STRIPE_PRO_MONTHLY_PRICE_ID"),
        // yearlyPriceId: useEnvVar("STRIPE_PRO_YEARLY_PRICE_ID"),
    },
    custom: {
        teamMemberLimit: Infinity,
        workflowRunLimit: Infinity,
        // monthlyPriceId: null!,
        // yearlyPriceId: null!,
    },
}

export function getPlanData(plan: BillingPlan) {
    return planData[plan]
}
