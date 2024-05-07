import "server-only"
import { db } from "./db"
import { supabaseServer } from "./supabase"
import { getPlanLimits } from "shared/plans"


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

    const { billing_plan, billing_start_date } = await db.selectFrom("projects")
        .select(["billing_plan", "billing_start_date"])
        .where("id", "=", projectId)
        .executeTakeFirstOrThrow()

    if (!billing_start_date)
        throw new Error("Billing start date not set. This is a bug. Please contact support.")

    const staticDay = billing_start_date.getUTCDate()

    const now = new Date()
    const currentMonth = now.getUTCMonth()
    const currentYear = now.getUTCFullYear()
    const thisMonthsDay = new Date(Date.UTC(currentYear, currentMonth, staticDay))

    const period = now < thisMonthsDay ? {
        start: new Date(Date.UTC(currentYear, currentMonth - 1, staticDay)),
        end: thisMonthsDay,
    } : {
        start: thisMonthsDay,
        end: new Date(Date.UTC(currentYear, currentMonth + 1, staticDay)),
    }

    return {
        plan: billing_plan,
        period,
        limits: getPlanLimits(billing_plan),
    }
}
