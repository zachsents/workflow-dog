import { NextUIProvider } from "@nextui-org/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ModalsProvider } from "@web/modules/modals"
import { NotificationsProvider } from "@web/modules/notifications"
import { SupabaseController } from "@web/modules/supabase"
import { useRouter } from "next/router"


const queryClient = new QueryClient()


export default function Providers({ children }) {

    const router = useRouter()

    return (
        <QueryClientProvider client={queryClient}>
            <NextUIProvider navigate={router.push}>
                <NotificationsProvider>
                    <ModalsProvider>
                        {children}
                    </ModalsProvider>
                </NotificationsProvider>
            </NextUIProvider>
            <SupabaseController />
        </QueryClientProvider>
    )
}
