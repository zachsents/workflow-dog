import Logo from "@web/public/logo.svg"
import Link from "next/link"
import DashboardHeaderNav from "./header-nav"
import ProjectSelector from "./project-selector"
import AccountMenu from "./account-menu"


export default function DashboardHeader() {
    return (
        <header className="flex items-center justify-between gap-10 px-10 py-4 border bg-white">
            <div className="flex items-center gap-10">
                <Link href="/" className="h-10 hover:scale-110 transition-transform">
                    <Logo className="w-auto h-full" />
                </Link>

                <ProjectSelector />

                <DashboardHeaderNav />
            </div>
            <div className="flex items-center gap-10">
                <AccountMenu />
            </div>
        </header>
    )
}