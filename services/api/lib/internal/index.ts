import { TRPCError } from "@trpc/server"
import { sql, type Selectable } from "kysely"
import { type WorkflowRuns } from "core/db"
import { getPlanLimits } from "core/plans"
import { db } from "../db"


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


export async function countWorkflowRunsInBillingPeriod(
    projectId: string,
    billingStart?: Date
) {
    if (!billingStart)
        billingStart = await getProjectBilling(projectId)
            .then(billing => billing.period.start)

    const { count } = await db.selectFrom("workflows_usage_records")
        .select(sql<number | null>`sum(run_count)`.as("count"))
        .leftJoin("workflows", "workflows_usage_records.workflow_id", "workflows.id")
        .where("workflows.project_id", "=", projectId)
        .where("workflows_usage_records.billing_period_id", "=", billingStart!.toISOString())
        .executeTakeFirstOrThrow()

    return count
}


export async function countProjectMembers(projectId: string) {
    const { count } = await db.selectFrom("projects_users")
        .select(({ fn }) => [fn.countAll<number>().as("count")])
        .where("project_id", "=", projectId)
        .executeTakeFirstOrThrow()

    return count
}


interface QueueWorkflowOptions {
    /** The ID of the triggering trigger */
    triggerId?: string
    /** a Workflow Run ID to copy trigger data from */
    copyTriggerDataFrom?: string
    scheduledFor?: Date
    triggerData: any
}

/**
 * Queues a new Workflow Run
 * @returns The ID of the new Workflow Run
 */
export async function queueWorkflow(workflowId: string, {
    triggerId,
    triggerData,
    copyTriggerDataFrom,
    scheduledFor,
}: QueueWorkflowOptions) {
    const workflow = await db.selectFrom("workflows")
        .selectAll()
        .where("id", "=", workflowId)
        .executeTakeFirstOrThrow()

    if (!workflow.project_id)
        throw new Error("Workflow isn't assigned to a project.")

    if (!workflow.is_enabled)
        throw new Error("Workflow is disabled")

    const billing = await getProjectBilling(workflow.project_id)
    const runCount = await countWorkflowRunsInBillingPeriod(workflow.project_id, billing.period.start)
    if (runCount != null && runCount >= billing.limits.workflowRuns)
        throw new WorkflowRunLimitExceededError(runCount, billing.limits.workflowRuns)

    const newRunId = await db.transaction().execute(async trx => {
        const runQuery = trx.insertInto("workflow_runs")
            .values(({ selectFrom }) => ({
                workflow_id: workflowId,
                workflow_graph_id: workflow.current_graph_id!,
                // TO DO: make sure runs stick around after triggers are deleted. we'll need to make sure we keep old triggers and just mark them as inactive.
                trigger_id: triggerId ?? null,
                trigger_payload: copyTriggerDataFrom
                    ? selectFrom("workflow_runs")
                        .select("trigger_payload")
                        .where("id", "=", copyTriggerDataFrom)
                    : triggerData,
                scheduled_for: scheduledFor,
                status: scheduledFor ? "scheduled" : "pending",
            }))
            .returning("id")
            .executeTakeFirstOrThrow()

        const usageQuery = runCount === null
            ? trx.insertInto("workflows_usage_records")
                .values({
                    workflow_id: workflowId,
                    run_count: 1,
                    billing_period_id: billing.period.start.toISOString(),
                })
                .execute()
            : trx.updateTable("workflows_usage_records")
                .set({
                    run_count: sql`run_count + 1`,
                })
                .where("workflow_id", "=", workflowId)
                .where("billing_period_id", "=", billing.period.start.toISOString())
                .execute()

        return Promise.all([runQuery, usageQuery]).then(r => r[0].id)
    })

    if (process.env.NODE_ENV === "development") {
        fetch(`${process.env.WORKFLOW_MAN_URL}/workflow-runs/${newRunId}/execute`, {
            method: "POST"
        })
    }
    else if (process.env.NODE_ENV === "production") {
        throw new Error("You need to implement task queuing in production.")
    }

    return newRunId
}


export function enrichWorkflowRunRow(row: Selectable<WorkflowRuns>) {
    return {
        ...row,
        error_count: (Array.isArray(row.node_errors) ? row.node_errors.length : 0)
            + (Array.isArray(row.global_errors) ? row.global_errors.length : 0),
        has_errors: Array.isArray(row.node_errors) && row.node_errors.length > 0
            || Array.isArray(row.global_errors) && row.global_errors.length > 0,
    }
}


export class WorkflowRunLimitExceededError extends Error {
    usage?: number
    limit?: number
    code = 429

    constructor(usage?: number, limit?: number) {
        super(`Plan limit exceeded${(usage && limit) ? ` (${usage} / ${limit} workflow runs)` : ""}`)
        this.usage = usage
        this.limit = limit
    }

    toTRPC() {
        return new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: this.message,
        })
    }
}