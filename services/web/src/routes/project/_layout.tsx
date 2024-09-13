import { IconBook, IconExternalLink, IconListDetails, IconPuzzle, IconReport, IconRouteSquare2, IconScript, IconUsers, IconZoomMoney } from "@tabler/icons-react"
import AccountMenu from "@web/components/account-menu"
import { BrandLink, FeedbackButton } from "@web/components/dashboard-header"
import ProjectSelector from "@web/components/project-selector"
import SimpleTooltip from "@web/components/simple-tooltip"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { useCurrentProject, useCurrentProjectId } from "@web/lib/hooks"
import { cn } from "@web/lib/utils"
import React, { forwardRef, useEffect } from "react"
import { Helmet } from "react-helmet"
import { Link, NavLink, Outlet } from "react-router-dom"


export default function ProjectLayout() {
    const projectId = useCurrentProjectId()

    useEffect(() => {
        localStorage.setItem("currentProjectId", projectId)
    }, [projectId])

    const { data: project, isLoading, isSuccess } = useCurrentProject()

    return <>
        <Helmet>
            <title>{project?.name ?? "Project"} - WorkflowDog</title>
        </Helmet>
        <div className="grid h-screen place-items-stretch" style={{
            gridTemplateRows: "auto 1fr",
            gridTemplateColumns: "auto 1fr",
        }}>
            <div className="row-span-full border-r grid grid-flow-row auto-rows-auto gap-10" style={{
                gridTemplateRows: "auto 1fr",
            }}>
                <div className="flex-center p-4">
                    <BrandLink withTitle href="/projects" className="text-lg" />
                </div>

                <nav className="flex flex-col items-stretch w-[240px]">
                    <NavGroup>
                        <NavButton to="" end icon={IconReport}>
                            Project Overview
                        </NavButton>
                    </NavGroup>
                    <NavGroup title="Build">
                        <NavButton to="workflows" icon={IconRouteSquare2}>
                            Workflows
                        </NavButton>
                        <NavButton to="integrations" icon={IconPuzzle}>
                            Integrations
                        </NavButton>
                    </NavGroup>
                    <NavGroup title="Learn">
                        <NavButton to="https://learn.workflow.dog" icon={IconBook} external>
                            Getting Started
                        </NavButton>
                        <NavButton to="https://learn.workflow.dog" icon={IconScript} external>
                            Docs
                        </NavButton>
                    </NavGroup>
                    <NavGroup title="Settings">
                        <NavButton to="team" icon={IconUsers}>
                            Team
                        </NavButton>
                        <NavButton to="usage-billing" icon={IconZoomMoney}>
                            Usage & Billing
                        </NavButton>
                    </NavGroup>
                </nav>

                <p className="text-muted-foreground text-xs text-center p-2 mb-4">
                    🔥 Made by{" "}
                    <a href="https://x.com/ZachSents" target="_blank" className="inline-flex items-center gap-1 hover:underline">
                        Zach Sents
                        <TI><IconExternalLink /></TI>
                    </a>
                </p>
            </div>

            <div className="flex items-stretch justify-between gap-4 p-2 border-b">
                <div className="flex items-stretch gap-2 *:shrink-0">
                    <SimpleTooltip tooltip="All Projects">
                        <Button variant="ghost" size="icon" asChild className="h-auto text-lg text-muted-foreground">
                            <Link to="/projects">
                                <TI><IconListDetails /></TI>
                            </Link>
                        </Button>
                    </SimpleTooltip>
                    <ProjectSelector />
                </div>

                <div className="flex items-center justify-end gap-6 pr-6">
                    <FeedbackButton />
                    <AccountMenu />
                </div>
            </div>

            {isLoading
                ? <SpinningLoader className="text-xl" />
                : isSuccess
                    ? <div className="overflow-y-scroll">
                        <Outlet />
                    </div>
                    : <div className="flex-center text-center text-muted-foreground">
                        <p>There was a problem loading your project.</p>
                    </div>}
        </div>
    </>
}


function NavGroup({ children, title, withBorder = false }: { children: any, title?: string, withBorder?: boolean }) {
    return (
        <div>
            {title &&
                <p className="text-left uppercase font-bold text-xs bg-gray-200 text-muted-foreground px-2 py-1">
                    {title}
                </p>}
            <div className={cn("flex flex-col items-stretch gap-1 p-2", withBorder && "border-b")}>
                {children}
            </div>
        </div>
    )
}


interface NavButtonProps {
    icon: React.ComponentType
    children: any
    external?: boolean
}

const NavButton = forwardRef<HTMLAnchorElement, NavButtonProps & React.ComponentProps<typeof NavLink>>(({
    icon: Icon,
    external,
    children,
    ...props
}, ref) =>
    <Button
        variant="ghost" size="default" asChild
        className="justify-start text-md items-center gap-2 h-auto py-1.5 [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:font-bold transition-colors"
    >
        <NavLink {...props} target={props.target ?? (external ? "_blank" : undefined)} ref={ref}>
            <TI className="text-[1.15em] shrink-0"><Icon /></TI>
            <div className="grow text-wrap">
                {children}
            </div>
            {external && <TI className="shrink-0 text-muted-foreground"><IconExternalLink /></TI>}
        </NavLink>
    </Button>
)