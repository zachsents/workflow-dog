import type { Metadata } from "next"
import "@web/styles/globals.css"
import { Providers } from "@web/app/providers"

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
            </body>
        </html>
    )
}
