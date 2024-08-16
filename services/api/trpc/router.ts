import type { inferRouterInputs, inferRouterOutputs, TRPCError } from "@trpc/server"
import supertokens from "supertokens-node"
import { authenticatedProcedure, t } from "."
import { db } from "../lib/db"
import projects from "./procedures/projects"
import workflows from "./procedures/workflows"

export const apiRouter = t.router({
    projects,
    workflows,
    // serviceAccounts,
    auth: {
        userId: authenticatedProcedure.query(async ({ ctx }) => ctx.user.id),
        user: authenticatedProcedure.query(async ({ ctx }) => {
            const [user, metadata] = await Promise.all([
                supertokens.getUser(ctx.user.id),
                db.selectFrom("user_meta")
                    .selectAll()
                    .where("id", "=", ctx.user.id)
                    .executeTakeFirst(),
            ])

            if (!user && !metadata)
                throw new TRPCError({ code: "NOT_FOUND" })

            return {
                ...user,
                metadata,
            }
        }),
    },
    health: t.procedure.query(() => "ok"),
})

export type ApiRouter = typeof apiRouter
export type ApiRouterInput = inferRouterInputs<ApiRouter>
export type ApiRouterOutput = inferRouterOutputs<ApiRouter>