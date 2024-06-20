import { Button } from "@web/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import Logo from "@web/public/logo.svg"
import Link from "next/link"
import { TbExternalLink, TbHeart, TbListDetails } from "react-icons/tb"
import AccountMenu from "./account-menu"
import ProjectSelector from "./project-selector"


export default function DashboardHeader() {
    return (
        <header className="flex between gap-10 px-10 py-4">
            <div className="flex items-center gap-10">
                <Link href="https://workflow.dog" className="h-10 hover:scale-110 transition-transform">
                    <Logo className="w-auto h-full" />
                </Link>

                <div className="flex items-center gap-4">
                    <AllProjectsButton />
                    <ProjectSelector />
                </div>

                {/* <DashboardHeaderNav /> */}
            </div>
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
    )
}



function AllProjectsButton() {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild size="icon" variant="ghost">
                        <Link href="/projects">
                            <TbListDetails />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>All Projects</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}