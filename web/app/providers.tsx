"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TRPCProvider } from "@web/lib/client/trpc"
import { useState } from "react"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // With SSR, we usually want to set some default staleTime
                        // above 0 to avoid refetching immediately on the client
                        staleTime: 60 * 1000,
                    },
                },
            })
    )

    return (
        <SessionProvider>
            <TRPCProvider queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </TRPCProvider>
        </SessionProvider>
    )
}