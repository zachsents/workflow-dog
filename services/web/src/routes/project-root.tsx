import { IconBook, IconChartLine, IconExternalLink, IconHammer, IconPlus, IconPuzzle, IconReport, IconUsers, IconVectorBezier2 } from "@tabler/icons-react"
import DashboardHeader from "@web/components/dashboard-header"
import SimpleTooltip from "@web/components/simple-tooltip"
import TI from "@web/components/tabler-icon"
import { Separator } from "@web/components/ui/separator"
import { cn } from "@web/lib/utils"
import { useEffect } from "react"
import { Link, Outlet, useLocation, useParams } from "react-router-dom"


export default function ProjectRoot() {
    const { projectId } = useParams() as { projectId: string }

    const relativeUrl = (path: string = "") => `/projects/${projectId}${path}`

    useEffect(() => {


        localStorage.setItem("currentProjectId", projectId)
    }, [projectId])

    return (
        <div className="grid h-screen place-items-stretch bg-gray-100 p-2 gap-2" style={{
            gridTemplateRows: "auto 1fr",
            gridTemplateColumns: "260px 1fr",
        }}>
            <Link
                to="/"
                className="group justify-self-start flex-center gap-2 font-bold hover:text-primary transition-colors px-2"
            >
                <span>WorkflowDog</span>
            </Link>
            <DashboardHeader />

            <div className="flex-v items-stretch gap-2 pt-6">
                <div className="flex-v items-stretch gap-1">
                    <NavItemButton big href={relativeUrl()}>
                        <TI><IconReport /></TI>
                        Project Overview
                    </NavItemButton>
                </div>

                <Separator className="bg-gray-300 mt-4" />

                <div className="flex-v items-stretch gap-1">
                    <NavSectionHeader
                        icon={<TI><IconVectorBezier2 /></TI>}
                        href="https://learn.workflow.dog/essentials/workflows"
                        learnAbout="Workflows"
                    >
                        Workflows
                    </NavSectionHeader>

                    {/* <WorkflowsList projectId={projectId} /> */}
                </div>

                <Separator className="bg-gray-300 mt-4" />

                <div className="flex-v items-stretch gap-1">
                    <NavSectionHeader
                        icon={<TI><IconHammer /></TI>}
                        href="https://learn.workflow.dog/essentials/custom-actions"
                        learnAbout="Custom Actions"
                    >
                        Custom Actions
                    </NavSectionHeader>
                    <p className="text-xs text-muted-foreground text-center">
                        Custom Actions are a way to reuse common tasks in your workflows. Coming soon!
                    </p>
                </div>

                <Separator className="bg-gray-300 mt-4" />

                <div className="flex-v items-stretch gap-1 mt-4">
                    <NavItemButton
                        big
                        href={relativeUrl("/integrations")}
                        tooltip="Connect your project to external services"
                    >
                        <TI><IconPuzzle /></TI>
                        Connected Accounts
                    </NavItemButton>
                    <NavItemButton
                        big
                        href={relativeUrl("/team")}
                        tooltip="Invite your team members to collaborate"
                    >
                        <TI><IconUsers /></TI>
                        Team
                    </NavItemButton>
                    <NavItemButton
                        big
                        href={relativeUrl("/usage")}
                        tooltip="See your project's usage and upgrade your plan"
                    >
                        <TI><IconChartLine /></TI>
                        Usage & Billing
                    </NavItemButton>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border">
                <Outlet />
            </div>
        </div>
    )
}


function NavSectionHeader({ children, icon, href, learnAbout }: {
    children: any,
    icon: React.ReactNode,
    href: string,
    learnAbout: string
}) {
    const btnClasses = "aspect-square p-2 hover:bg-gray-400/50 rounded-sm text-muted-foreground"

    return (
        <div className="flex justify-between items-center gap-2 text-sm pl-2">
            {icon}
            <span className="grow">
                {children}
            </span>
            <div className="flex items-center gap-1">
                <SimpleTooltip tooltip="Create a new Workflow">
                    <button className={btnClasses}>
                        <TI><IconPlus /></TI>
                    </button>
                </SimpleTooltip>
                <SimpleTooltip tooltip={
                    <div className="flex place-items-center gap-2">
                        <span>{`Learn about ${learnAbout}`}</span>
                        <TI><IconExternalLink /></TI>
                    </div>
                }>
                    <a className={btnClasses} href={href} target="_blank">
                        <TI><IconBook /></TI>
                    </a>
                </SimpleTooltip>
            </div>
        </div>
    )
}


function NavItemButton({ children, href, big, tooltip }: {
    children: any
    href: string
    big?: boolean
    tooltip?: string
}) {
    const { pathname } = useLocation()
    const isActive = pathname === href

    const linkComp =
        <Link
            to={href}
            className={cn(
                "text-sm text-left truncate rounded-sm px-2 py-1 flex items-center gap-2",
                isActive
                    ? "text-violet-700 bg-violet-300/50 font-bold"
                    : "hover:bg-gray-400/30",
                (big || isActive)
                    ? "py-2"
                    : "py-1"
            )}
        >
            {children}
        </Link>

    return tooltip
        ? <SimpleTooltip
            tooltip={<p className="max-w-36">{tooltip}</p>}
            contentProps={{ side: "right" }}
            delay={500}
        >
            {linkComp}
        </SimpleTooltip>
        : linkComp
}