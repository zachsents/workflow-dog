import type { Metadata } from "next"
import "@web/styles/globals.css"
import { Providers } from "@web/app/providers"
import { Toaster } from "@ui/toaster"

export const metadata: Metadata = {
    title: "WorkflowDog",
    description: "Automation for power users.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
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
