"use client"

import type { QueryClient } from "@tanstack/react-query"
import { createTRPCReact, httpBatchLink } from "@trpc/react-query"
import "client-only"
import { useState } from "react"
import type { AppRouter } from "../types/trpc"
import SuperJSON from "superjson"


export const trpc = createTRPCReact<AppRouter>()


export function TRPCProvider({ queryClient, children }: { queryClient: QueryClient, children: any }) {
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
                    async headers() {
                        return {
                            // authorization: getAuthCookie(),
                        }
                    },
                    transformer: SuperJSON,
                }),
            ],
        }),
    )

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            {children}
        </trpc.Provider>
    )
}