import DashboardHeader from "@web/components/dashboard/header"
import { requireLogin } from "@web/lib/server/supabase"


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireLogin()

    return (
        <div className="bg-slate-200 bg-dots h-full">
            <DashboardHeader />
            <main className="max-w-5xl mx-auto py-12 flex-v items-stretch gap-4">
                {children}
            </main>
        </div>
    )
}
