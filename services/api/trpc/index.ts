import { TRPCError, initTRPC } from "@trpc/server"
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import type { Request, Response } from "express"
import SuperJSON from "superjson"
import type { SessionRequest } from "supertokens-node/framework/express"
import { verifySession } from "supertokens-node/recipe/session/framework/express"
import { ZodError } from "zod"


export const t = initTRPC.context<ApiContext>().create({
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

export async function createContext({
    req,
    res,
}: CreateExpressContextOptions): Promise<ApiContext> {
    return {
        req,
        res,
        user: null,
        isAuthenticatedUser: false,
    }
}

export const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
    await verifySession({
        checkDatabase: true,
        antiCsrfCheck: true,
        sessionRequired: false,
    })(ctx.req, ctx.res, async () => { })

    const session = (ctx.req as SessionRequest).session

    if (!session)
        throw new TRPCError({ code: "UNAUTHORIZED" })

    const userId = session.getUserId()

    return next({
        ctx: {
            ...ctx,
            user: { id: userId },
            isAuthenticatedUser: true as const,
        }
    })
})

export type ApiContext = {
    req: Request
    res: Response
} & ({
    user: { id: string }
    isAuthenticatedUser: true
} | {
    user: null
    isAuthenticatedUser: false
})

