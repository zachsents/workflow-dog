import { type SelectQueryBuilder, sql } from "kysely"
import type { DB, ProjectPermission } from "core/db"
import { db } from "./db"


export async function queryUserPermission(
    userId: string,
    permission: ProjectPermission,
    /** Include any joins needed as well as `where` filters */
    createExpr: (builder: SelectQueryBuilder<DB, "projects_users", {}>) => SelectQueryBuilder<DB, any, {}>
) {
    const queryResult = await createExpr(db.selectFrom("projects_users"))
        .where("projects_users.user_id", "=", userId)
        .select(sql<boolean>`${permission} = any(projects_users.permissions)`.as("has_permission"))
        .executeTakeFirst()

    return queryResult?.has_permission || false
}


export function userHasProjectPermission(userId: string, permission: ProjectPermission) {
    return {
        byProjectId: (projectId: string) => queryUserPermission(userId, permission, qb => qb
            .where("projects_users.project_id", "=", projectId)
        ),
        byWorkflowId: (workflowId: string) => queryUserPermission(userId, permission, qb => qb
            .innerJoin("workflows", "workflows.project_id", "projects_users.project_id")
            .where("workflows.id", "=", workflowId)
        ),
        byWorkflowRunId: (runId: string) => queryUserPermission(userId, permission, qb => qb
            .innerJoin("workflows", "workflows.project_id", "projects_users.project_id")
            .innerJoin("workflow_runs", "workflow_runs.workflow_id", "workflows.id")
            .where("workflow_runs.id", "=", runId)
        ),
    }
}
