"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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
        <QueryClientProvider client={queryClient}>
            <QueryStoreProvider>
                {children}
            </QueryStoreProvider>
        </QueryClientProvider>
    )
}