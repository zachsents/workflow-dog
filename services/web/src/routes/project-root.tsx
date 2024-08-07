import { IconBook, IconChartLine, IconExternalLink, IconMoneybag, IconPuzzle, IconReport, IconRouteSquare2, IconScript, IconUsers } from "@tabler/icons-react"
import AccountMenu from "@web/components/account-menu"
import { BrandLink, FeedbackButton } from "@web/components/dashboard-header"
import ProjectSelector from "@web/components/project-selector"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { useCurrentProjectId } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import { forwardRef, useEffect } from "react"
import { NavLink, Outlet } from "react-router-dom"


export default function ProjectRoot() {
    const projectId = useCurrentProjectId()

    useEffect(() => {
        localStorage.setItem("currentProjectId", projectId)
    }, [projectId])

    const { isLoading, isSuccess } = trpc.projects.byId.useQuery({ id: projectId })

    return (
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
                        <NavButton to="" icon={IconReport}>
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
                        <NavButton to="usage" icon={IconChartLine}>
                            Usage
                        </NavButton>
                        <NavButton to="billing" icon={IconMoneybag}>
                            Billing
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

            <div className="flex items-stretch justify-between p-2 border-b">
                <ProjectSelector />

                <div className="flex items-center justify-end gap-6">
                    <FeedbackButton />
                    <AccountMenu />
                </div>
            </div>

            {isLoading
                ? <div className="flex-center text-xl gap-2">
                    <SpinningLoader />
                </div>
                : isSuccess
                    ? <div>
                        <Outlet />
                    </div>
                    : <div className="flex-center text-center text-muted-foreground">
                        <p>There was a problem loading your project.</p>
                    </div>}
        </div>
    )
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

