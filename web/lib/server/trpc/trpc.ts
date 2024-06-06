import { initTRPC } from "@trpc/server"
import { NextRequest } from "next/server"
import "server-only"
import SuperJSON from "superjson"
import { ZodError } from "zod"
import { getVerifiedSession, supabaseServer, supabaseVerifyJWT } from "../supabase"

export const t = initTRPC.context<TRPCContext>().create({
    errorFormatter: ({ shape, error }) => {
        const zodError = error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null
        const message = zodError
            ? [
                ...zodError.formErrors,
                ...Object.values(zodError.fieldErrors).flat().filter(Boolean),
            ].join(", ")
            : error.message

        return {
            ...shape,
            data: {
                ...shape.data,
                zodError,
                message,
            },
        }
    },
    transformer: SuperJSON,
})

import projects from "./procedures/projects"
import serviceAccounts from "./procedures/service-accounts"
import workflows from "./procedures/workflows"

export const appRouter = t.router({
    projects,
    workflows,
    serviceAccounts,
})

export async function createContext(req: NextRequest) {

    const authTypesPresent = new Set<"session" | "authHeader" | "query">()

    const [session, user] = await Promise.all([
        getVerifiedSession(),
        supabaseServer().auth.getUser(),
    ])

    if (session)
        authTypesPresent.add("session")

    const authHeaderVerif = supabaseVerifyJWT(req)

    if (authHeaderVerif.verified)
        authTypesPresent.add("authHeader")

    const queryToken = req.nextUrl.searchParams.get("access_token")
    const queryVerif = queryToken
        ? supabaseVerifyJWT(queryToken)
        : null

    if (queryVerif?.verified)
        authTypesPresent.add("query")

    return {
        req,
        session,
        userId: session?.user_id,
        user,
        role: authHeaderVerif.verified
            ? authHeaderVerif.payload.role
            : queryVerif?.verified
                ? queryVerif.payload.role
                : session?.role,
    }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>
