/**
 * Adapted from
 * https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-kysely/src/index.ts
 */

import { type Adapter } from "next-auth/adapters"
import { db } from "../db"


export const CustomKyselyAdapter: Adapter = {

    /* Users ------------------------------------------------ */
    createUser: data => db
        .insertInto("auth.users")
        .values(data)
        .returningAll()
        .executeTakeFirstOrThrow(),
    getUser: id => db
        .selectFrom("auth.users")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst()
        .then(r => r || null),
    getUserByEmail: email => db
        .selectFrom("auth.users")
        .selectAll()
        .where("email", "=", email)
        .executeTakeFirst()
        .then(r => r || null),
    getUserByAccount: ({ providerAccountId, provider }) => db
        .selectFrom("auth.users")
        .innerJoin("auth.accounts", "auth.users.id", "auth.accounts.userId")
        .selectAll("auth.users")
        .where("auth.accounts.providerAccountId", "=", providerAccountId)
        .where("auth.accounts.provider", "=", provider)
        .executeTakeFirst()
        .then(r => r || null),
    updateUser: ({ id, ...user }) => db
        .updateTable("auth.users")
        .set(user)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow(),
    deleteUser: userId => void db
        .deleteFrom("auth.users")
        .where("id", "=", userId)
        .executeTakeFirstOrThrow(),

    /* Accounts --------------------------------------------- */
    linkAccount: account => void db
        .insertInto("auth.accounts")
        .values(account)
        .executeTakeFirstOrThrow(),
    unlinkAccount: ({ providerAccountId, provider }) => void db
        .deleteFrom("auth.accounts")
        .where("providerAccountId", "=", providerAccountId)
        .where("provider", "=", provider)
        .executeTakeFirstOrThrow(),

    /* Sessions --------------------------------------------- */
    createSession: session => db
        .insertInto("auth.sessions")
        .values(session)
        .returningAll()
        .executeTakeFirstOrThrow(),
    getSessionAndUser: async sessionToken => {
        const result = await db
            .selectFrom("auth.sessions")
            .innerJoin("auth.users", "auth.users.id", "auth.sessions.userId")
            .selectAll("auth.users")
            .select(["auth.sessions.expires", "auth.sessions.userId"])
            .where("sessionToken", "=", sessionToken)
            .executeTakeFirst()

        if (!result) return null

        const { userId, expires, ...user } = result
        return {
            user,
            session: { sessionToken, userId, expires },
        }
    },
    updateSession: (session) => db
        .updateTable("auth.sessions")
        .set(session)
        .where("sessionToken", "=", session.sessionToken)
        .returningAll()
        .executeTakeFirstOrThrow(),
    deleteSession: sessionToken => void db
        .deleteFrom("auth.sessions")
        .where("sessionToken", "=", sessionToken)
        .executeTakeFirstOrThrow(),

    /* Verification Tokens ---------------------------------- */
    createVerificationToken: data => db
        .insertInto("auth.verification_token")
        .values(data)
        .returningAll()
        .executeTakeFirstOrThrow(),
    useVerificationToken: ({ identifier, token }) => db
        .deleteFrom("auth.verification_token")
        .where("token", "=", token)
        .where("identifier", "=", identifier)
        .returningAll()
        .executeTakeFirst()
        .then(r => r || null),
}
