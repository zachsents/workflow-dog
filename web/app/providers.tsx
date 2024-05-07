"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SupabaseSetup } from "@web/lib/client/supabase"
import { TRPCProvider } from "@web/lib/client/trpc"
import { QueryStoreProvider } from "@web/lib/queries/store"
import { useState } from "react"

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
        <TRPCProvider queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <QueryStoreProvider>
                    {children}
                </QueryStoreProvider>
                <SupabaseSetup />
            </QueryClientProvider>
        </TRPCProvider>
    )
}