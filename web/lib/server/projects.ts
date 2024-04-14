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
    const { billing_plan, billing_start_date } = await supabase
        .from("teams")
        .select("billing_plan, billing_start_date")
        .eq("id", projectId)
        .single()
        .throwOnError()
        .then(q => ({
            billing_plan: q.data?.billing_plan || "free",
            billing_start_date: q.data?.billing_start_date || "2021-01-01",
        }))

    const staticDay = parseInt(billing_start_date.split("-")[2])

    const now = new Date()
    const currentMonth = now.getUTCMonth()
    const currentYear = now.getUTCFullYear()
    const thisMonthsDay = new Date(Date.UTC(currentYear, currentMonth, staticDay))

    const period: ProjectBillingPeriod = now < thisMonthsDay ? {
        start: new Date(Date.UTC(currentYear, currentMonth - 1, staticDay)),
        end: thisMonthsDay,
    } : {
        start: thisMonthsDay,
        end: new Date(Date.UTC(currentYear, currentMonth + 1, staticDay)),
    }

    return {
        plan: billing_plan as ProjectBillingPlan,
        period
    }
}

export type ProjectBillingPlan = "free" | "pro"

export type ProjectBillingPeriod = {
    start: Date
    end: Date
}