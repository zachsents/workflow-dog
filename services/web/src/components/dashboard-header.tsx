import { IconExternalLink, IconHeart } from "@tabler/icons-react"
import AccountMenu from "./account-menu"
import TI from "./tabler-icon"
import { Button } from "./ui/button"

interface DashboardHeaderProps {
    withBrandTitle?: boolean
}

export default function DashboardHeader({
    withBrandTitle = false,
}: DashboardHeaderProps) {
    return (
        <header className="flex justify-between gap-10 px-10 py-4 self-stretch">
            <div className="flex items-center gap-10">
                <a href="/" className="group h-10 flex items-center gap-4">
                    <img src="/logo.svg" className="w-auto h-full transition-transform group-hover:scale-110" />
                    {withBrandTitle &&
                        <h1 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            WorkflowDog
                        </h1>}
                </a>
            </div>
            <div className="flex items-center gap-10">
                <Button asChild variant="outline" size="sm" className="group gap-2">
                    <a href="/feedback" target="_blank">
                        <TI>
                            <IconHeart className="group-hover:scale-125 group-hover:fill-red-500 transition" />
                        </TI>
                        Leave Feedback
                        <TI><IconExternalLink /></TI>
                    </a>
                </Button>
                <AccountMenu />
            </div>
        </header>
    )
}
