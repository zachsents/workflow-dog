import { TRPCError } from "@trpc/server"
import supertokens from "supertokens-node"
import { authenticatedProcedure } from ".."
import { db } from "../../lib/db"

export default {
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
}