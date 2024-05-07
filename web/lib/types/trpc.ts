import type { appRouter } from "../server/trpc"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

export type AppRouter = typeof appRouter

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>