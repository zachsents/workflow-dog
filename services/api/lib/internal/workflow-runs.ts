import { db } from "../db"
import _mapValues from "lodash/mapValues"
import _merge from "lodash/merge"
import _groupBy from "lodash/groupBy"


export async function getWorkflowRunStatus(workflowRunId: string, {
    withOutputs = false,
}: {
    withOutputs?: boolean
} = {}) {
    const run = await db.selectFrom("workflow_runs")
        .select(["status", "node_errors"])
        .where("id", "=", workflowRunId)
        .executeTakeFirst()

    if (!run)
        throw new Error("Workflow run not found")

    const { node_errors, ...rest } = run

    const outputRows = withOutputs
        ? await db.selectFrom("workflow_run_outputs")
            .select(["node_id", "handle_id", "value"])
            .where("workflow_run_id", "=", workflowRunId)
            .where("is_global", "=", false)
            .execute()
        : []

    const node_data = _merge({},
        _mapValues(_groupBy(outputRows, "node_id"), rows => ({
            outputs: Object.fromEntries(rows.map(row =>
                [row.handle_id, row.value] as const
            )),
        })),
        _mapValues(node_errors as any, error => ({ error })),
    )

    return { ...rest, node_data }
}