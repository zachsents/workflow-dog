import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TRPCClientError } from "@trpc/client"
import { TRPCProvider } from "@web/lib/trpc"
import { useState } from "react"
import { toast } from "sonner"

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
                    mutations: {
                        onError: err => {
                            if (err instanceof TRPCClientError) {
                                if (err.data?.code === "FORBIDDEN")
                                    toast.error("You don't have permission to do that.")
                            }
                        }
                    },
                },
            })
    )

    return (
        <TRPCProvider queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </TRPCProvider>
    )
}