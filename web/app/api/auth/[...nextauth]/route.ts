import { authOptions } from "@web/lib/server/auth/config"
import { useEnvVars } from "@web/lib/server/utils"
import NextAuth from "next-auth"

useEnvVars(
    "AUTH_GOOGLE_CLIENT_ID",
    "AUTH_GOOGLE_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
)

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
