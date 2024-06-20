import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { AppRouter } from "@web/lib/types/trpc"
import SuperJSON from "superjson"

if (!process.env.WFD_ADMIN_KEY)
    throw new Error("WFD_ADMIN_KEY not set")

if (!process.env.API_SERVER_URL)
    throw new Error("API_SERVER_URL not set")

export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${process.env.API_SERVER_URL}/trpc`,
            transformer: SuperJSON,
            headers: {
                authorization: `Bearer ${process.env.WFD_ADMIN_KEY}`
            },
        }),
    ],
})