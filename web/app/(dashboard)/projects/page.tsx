import { Button } from "@web/components/ui/button"
import Logo from "@web/public/logo.svg"
import Link from "next/link"
import { TbExternalLink, TbHeart } from "react-icons/tb"
import AccountMenu from "../_components/account-menu"
import CreateProject from "./_components/create-project"
import ProjectsGrid from "./_components/projects-grid"


export default async function ProjectsPage() {

    return (
        <div className="bg-slate-200 min-h-full flex-v items-center">
            <header className="flex justify-between gap-10 px-10 py-4 self-stretch">
                <Link href="/" className="h-10 hover:scale-110 transition-transform">
                    <Logo className="w-auto h-full" />
                </Link>
                <div className="flex items-center gap-10">
                    <Button asChild variant="secondary" size="sm">
                        <a
                            href="/feedback" target="_blank"
                            className="group flex center gap-2"
                        >
                            <TbHeart className="group-hover:scale-125 group-hover:fill-red-500 transition" />
                            Leave Feedback
                            <TbExternalLink />
                        </a>
                    </Button>
                    <AccountMenu />
                </div>
            </header>
            <div className="w-full max-w-5xl grow bg-white rounded-3xl shadow-2xl mt-2 mb-10 p-12 flex-v items-stretch gap-4">
                <div className="flex justify-between gap-10">
                    <h1 className="text-2xl font-bold">
                        Select a project
                    </h1>
                    <CreateProject />
                </div>
                <ProjectsGrid />
            </div>
        </div>
    )
}