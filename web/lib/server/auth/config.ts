import _ from "lodash"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { initUser } from "../internal/users"
import { CustomKyselyAdapter } from "./adapter"


export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    adapter: CustomKyselyAdapter,
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, profile, }) {
            if (profile) {
                token.profile = _.omit(profile, ["iat", "exp", "iss", "azp", "aud", "sub", "at_hash"])
            }
            token.id = token.sub
            return token
        },
        async session({ session, token }) {
            const { profile } = token as { profile: any }
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    firstName: profile?.given_name || profile?.first_name,
                    lastName: profile?.family_name || profile?.last_name,
                },
            }
        },
    },
    events: {
        createUser: async ({ user }) => {
            console.debug(`Initializing user ${user.name} <${user.email}> (${user.id})`)
            await initUser(user)
        },
    }
}