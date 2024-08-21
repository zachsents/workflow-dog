import type { QueryClient } from "@tanstack/react-query"
import { createTRPCClient } from "@trpc/client"
import { createTRPCReact, httpBatchLink } from "@trpc/react-query"
import type { ApiRouter } from "api/trpc/router"
import { useState } from "react"
import SuperJSON from "superjson"


export const trpc = createTRPCReact<ApiRouter>()

export function TRPCProvider({ queryClient, children }: {
    queryClient: QueryClient
    children: any
}) {
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: "/api/trpc",
                transformer: SuperJSON,
            }),
        ],
    }))

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            {children}
        </trpc.Provider>
    )
}

export const vtrpc = createTRPCClient<ApiRouter>({
    links: [
        httpBatchLink({
            url: "/api/trpc",
            transformer: SuperJSON,
        }),
    ],
})