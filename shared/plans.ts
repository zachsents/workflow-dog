
const PlanLimits = {
    free: {
        teamMembers: 3,
        workflowRuns: 100,
    },
    pro: {
        teamMembers: 20,
        workflowRuns: 10000,
    },
}

export function getPlanLimits(plan: (keyof typeof PlanLimits) | null) {
    return PlanLimits[plan || "free"]
}