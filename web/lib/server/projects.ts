import { supabaseServer } from "./supabase"
import "server-only"


export async function isCurrentUserOwner(projectId: string) {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id

    const projectQuery = await supabase
        .from("teams")
        .select("creator")
        .eq("id", projectId)
        .single()
        .throwOnError()

    return !!userId && !!projectQuery.data && projectQuery.data.creator === userId
}


export async function getProjectBilling(projectId: string) {
    const supabase = supabaseServer()
    const projectQuery = await supabase
        .from("teams")
        .select("billing_plan, billing_start_date")
        .eq("id", projectId)
        .single()
        .throwOnError()

    const plan = projectQuery.data?.billing_plan || "free"

    const staticDay = new Date(projectQuery.data?.billing_start_date!)
        .getUTCDate()

    const now = new Date()
    const currentMonth = now.getUTCMonth()
    const currentYear = now.getUTCFullYear()
    const thisMonthsDay = new Date(currentYear, currentMonth, staticDay)

    const period: ProjectBillingPeriod = now < thisMonthsDay ? {
        start: new Date(currentYear, currentMonth - 1, staticDay),
        end: thisMonthsDay
    } : {
        start: thisMonthsDay,
        end: new Date(currentYear, currentMonth + 1, staticDay)
    }

    return {
        plan: plan as ProjectBillingPlan,
        period
    }
}

export type ProjectBillingPlan = "free" | "pro"

export type ProjectBillingPeriod = {
    start: Date
    end: Date
}