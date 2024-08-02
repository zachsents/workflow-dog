import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { authenticatedProcedure, t } from "."
import supertokens from "supertokens-node"
import projects from "./procedures/projects"

export const apiRouter = t.router({
    projects,
    // workflows,
    // serviceAccounts,
    auth: {
        user: authenticatedProcedure.query(async ({ ctx }) =>
            supertokens.getUser(ctx.user.id) ?? null
        )
    },
    health: t.procedure.query(() => "ok"),
})

export type ApiRouter = typeof apiRouter
export type ApiRouterInput = inferRouterInputs<ApiRouter>
export type ApiRouterOutput = inferRouterOutputs<ApiRouter>