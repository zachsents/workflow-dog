import { sql, type Kysely, type Transaction } from "kysely"
import { db } from "../db"
import type { DB } from "core/db"
import { getPlanLimits } from "core/plans"


export async function isProjectUnderTeamLimit(projectId: string, {
    dbHandle = db,
}: {
    dbHandle?: Kysely<DB> | Transaction<DB>
} = {}) {
    const { billing_plan } = await dbHandle.selectFrom("projects")
        .select("billing_plan")
        .where("id", "=", projectId)
        .executeTakeFirstOrThrow()

    const limit = getPlanLimits(billing_plan).teamMembers

    const { under_limit } = await dbHandle.selectFrom("projects_users")
        .select(sql<boolean>`count(*) < ${limit}`.as("under_limit"))
        .where("project_id", "=", projectId)
        .executeTakeFirstOrThrow()

    return under_limit
}