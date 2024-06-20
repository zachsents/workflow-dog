import { TRPCError } from "@trpc/server"
import assert from "node:assert"
import type { TRPCContext } from "./setup"


export function assertAuthenticated(ctx: TRPCContext) {
    return assert(
        !!ctx.user && ctx.role === "authenticated",
        forbidden("Must be an authenticated user to access this procedure.")
    )
}

export function assertAdmin(ctx: TRPCContext) {
    return assert(
        ctx.role === "service_role",
        forbidden("Must be an admin to access this procedure.")
    )
}

export function forbidden(message?: string) {
    return new TRPCError({
        code: "FORBIDDEN",
        ...message && { message },
    })
}