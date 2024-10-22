import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { t } from "."
import auth from "./procedures/auth"
import projects from "./procedures/projects"
import workflows from "./procedures/workflows"
import thirdParty from "./procedures/third-party"

export const apiRouter = t.router({
    projects,
    workflows,
    auth,
    thirdParty,
    health: t.procedure.query(() => "ok"),
})

export type ApiRouter = typeof apiRouter
export type ApiRouterInput = inferRouterInputs<ApiRouter>
export type ApiRouterOutput = inferRouterOutputs<ApiRouter>