import { NextUIProvider } from "@nextui-org/react"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { fire } from "@web/modules/firebase"
import { ModalsProvider } from "@web/modules/modals"
import { NotificationsProvider } from "@web/modules/notifications"
import { SupabaseController } from "@web/modules/supabase"
import { FirebaseProvider } from "@zachsents/fire-query"
import { useRouter } from "next/router"


const queryClient = new QueryClient()


export default function Providers({ children }) {

    const router = useRouter()

    return (
        <QueryClientProvider client={queryClient}>
            <FirebaseProvider
                auth={fire.auth}
                firestore={fire.db}
                functions={fire.functions}
            >
                <NextUIProvider navigate={router.push}>
                    <NotificationsProvider>
                        <ModalsProvider>
                            {children}
                        </ModalsProvider>
                    </NotificationsProvider>
                </NextUIProvider>
            </FirebaseProvider>
            <SupabaseController />
        </QueryClientProvider>
    )
}
