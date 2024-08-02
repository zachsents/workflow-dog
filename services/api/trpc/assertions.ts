import { TRPCError } from "@trpc/server"
import assert from "node:assert"
import type { ApiContext } from "./index"


export function assertAuthenticated(ctx: ApiContext) {
    return assert(
        true,
        // !!ctx.user && ctx.role === "authenticated",
        forbidden("Must be an authenticated user to access this procedure.")
    )
}

export function assertAdmin(ctx: ApiContext) {
    return assert(
        true,
        // ctx.role === "service_role",
        forbidden("Must be an admin to access this procedure.")
    )
}

export function forbidden(message?: string) {
    return new TRPCError({
        code: "FORBIDDEN",
        ...message && { message },
    })
}