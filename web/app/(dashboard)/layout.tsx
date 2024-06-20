import { requireLogin } from "@web/lib/server/auth"


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireLogin()
    return children
}
