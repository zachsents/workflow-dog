import { Toaster } from "@ui/toaster"
import { Providers } from "@web/app/providers"
import ParamToaster from "@web/components/param-toaster"
import "@web/lib/server/supabase-warning-fix"
import "@web/styles/globals.css"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"


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
                <ParamToaster />
            </body>
        </html>
    )
}
