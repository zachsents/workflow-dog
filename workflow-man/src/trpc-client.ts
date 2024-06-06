import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { AppRouter } from "@web/lib/types/trpc"
import SuperJSON from "superjson"

export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${process.env.API_SERVER_URL}/trpc`,

            async headers() {
                return process.env.SUPABASE_SERVICE_KEY ? {
                    authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                } : {}
            },

            transformer: SuperJSON,
        }),
    ],
})