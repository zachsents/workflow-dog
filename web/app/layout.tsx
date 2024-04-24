import "@web/styles/globals.css"
import type { Metadata } from "next"
import { Providers } from "@web/app/providers"
import { Toaster } from "@ui/toaster"
import { DM_Sans } from "next/font/google"
import "@web/lib/server/supabase-warning-fix"


export const metadata: Metadata = {
    title: "WorkflowDog",
    description: "Automation for power users.",
}

const dmSans = DM_Sans({
    subsets: ["latin"],
    display: "swap",
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={dmSans.className}>
            <body>
                <Providers>
                    {children}
                </Providers>
                <Toaster toastOptions={{
                    descriptionClassName: "text-muted-foreground",
                }} />
            </body>
        </html>
    )
}
