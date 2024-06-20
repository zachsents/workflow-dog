import { initTRPC } from "@trpc/server"
import { NextRequest } from "next/server"
import SuperJSON from "superjson"
import { ZodError } from "zod"
import { getSession } from "../auth"


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


export async function createContext(req: NextRequest) {

    const session = await getSession()

    return {
        req,
        session,
        userId: session?.user?.id,
        user: session?.user,
        // role: authHeaderVerif.verified
        //     ? authHeaderVerif.payload.role
        //     : queryVerif?.verified
        //         ? queryVerif.payload.role
        //         : session?.role,
        role: "authenticated",
    }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>