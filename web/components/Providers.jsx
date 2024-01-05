import { fire } from "@web/modules/firebase"
import { FirebaseProvider } from "@zachsents/fire-query"
import { QueryClient, QueryClientProvider } from "react-query"
import { NextUIProvider } from "@nextui-org/react"
import { useRouter } from "next/router"
import { NotificationsProvider } from "@web/modules/notifications"


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
                        {children}
                    </NotificationsProvider>
                </NextUIProvider>
            </FirebaseProvider>
        </QueryClientProvider>
    )
}
