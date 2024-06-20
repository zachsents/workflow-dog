import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { db } from "../../db"
import { getServiceAccountToken } from "../../internal/service-accounts"
import { assertAdmin } from "../assertions"
import { t } from "../setup"


export default {
    getToken: t.procedure
        .input(z.object({
            accountId: z.string(),
            requestingWorkflowId: z.string().uuid().optional(),
            requestingProjectId: z.string().uuid().optional(),
        }))
        .query(async ({ input, ctx }) => {
            assertAdmin(ctx)

            if (input.requestingProjectId) {
                const isValid = await db.selectNoFrom(eb => eb.exists(
                    eb.selectFrom("projects_service_accounts")
                        .where("service_account_id", "=", input.accountId)
                        .where("project_id", "=", input.requestingProjectId!)
                ).as("exists"))
                    .executeTakeFirstOrThrow()
                    .then(r => Boolean(r.exists))

                if (!isValid)
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: `Service account (${input.accountId}) is not linked to the project (${input.requestingProjectId}).`,
                    })
            }

            if (input.requestingWorkflowId) {
                const isValid = await db.selectNoFrom(eb => eb.exists(
                    eb.selectFrom("projects_service_accounts")
                        .where("service_account_id", "=", input.accountId)
                        .where(eb => eb(
                            "project_id", "=",
                            eb.selectFrom("workflows")
                                .select("workflows.project_id")
                                .where("workflows.id", "=", input.requestingWorkflowId!)
                        ))
                ).as("exists"))
                    .executeTakeFirstOrThrow()
                    .then(r => Boolean(r.exists))

                if (!isValid)
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: `Service account (${input.accountId}) is not linked to the project that workflow (${input.requestingWorkflowId}) is a part of.`,
                    })
            }

            const token = await getServiceAccountToken(input.accountId)

            return token
        }),
}