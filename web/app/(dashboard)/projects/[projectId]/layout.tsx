"use client"

import { Button } from "@web/components/ui/button"
import { Separator } from "@web/components/ui/separator"
import Logo from "@web/public/logo.svg"
import Link from "next/link"
import { TbChartLine, TbExternalLink, TbHammer, TbHeart, TbPuzzle, TbReport, TbUsers, TbVectorBezier2 } from "react-icons/tb"
import AccountMenu from "../../_components/account-menu"
import ProjectSelector from "../../_components/project-selector"
import { NavItemButton, NavSectionHeader } from "../_components/project-nav"
import WorkflowsList from "../_components/workflows-list"
import { useEffect } from "react"


export default async function ProjectLayout({
    children,
    params: { projectId }
}: {
    children: any,
    params: { projectId: string }
}) {
    const relativeUrl = (path: string = "") => `/projects/${projectId}${path}`

    useEffect(() => {


        localStorage.setItem("currentProjectId", projectId)
    }, [projectId])

    return (
        <div className="grid h-full place-items-stretch bg-slate-100 p-2 gap-2" style={{
            gridTemplateRows: "auto 1fr",
            gridTemplateColumns: "260px 1fr",
        }}>
            <Link
                href="https://workflow.dog"
                className="group justify-self-start flex center gap-2 font-bold hover:text-primary transition-colors px-2"
            >
                <Logo className="w-auto h-8 group-hover:scale-105 transition-transform" />
                <span>WorkflowDog</span>
            </Link>
            <header className="flex between gap-10 px-4">
                <ProjectSelector />
                <div className="flex items-center gap-10">
                    <Button asChild variant="ghost" size="sm">
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

            <div className="flex-v items-stretch gap-2 pt-6">
                <div className="flex-v items-stretch gap-1">
                    <NavItemButton big href={relativeUrl()}>
                        <TbReport />
                        Project Overview
                    </NavItemButton>
                </div>

                <Separator className="bg-slate-300 mt-4" />

                <div className="flex-v items-stretch gap-1">
                    <NavSectionHeader
                        icon={<TbVectorBezier2 />}
                        href="https://learn.workflow.dog/essentials/workflows"
                        learnAbout="Workflows"
                    >
                        Workflows
                    </NavSectionHeader>

                    <WorkflowsList projectId={projectId} />
                </div>

                <Separator className="bg-slate-300 mt-4" />

                <div className="flex-v items-stretch gap-1">
                    <NavSectionHeader
                        icon={<TbHammer />}
                        href="https://learn.workflow.dog/essentials/custom-actions"
                        learnAbout="Custom Actions"
                    >
                        Custom Actions
                    </NavSectionHeader>
                    <p className="text-xs text-muted-foreground text-center">
                        Custom Actions are a way to reuse common tasks in your workflows. Coming soon!
                    </p>
                </div>

                <Separator className="bg-slate-300 mt-4" />

                <div className="flex-v items-stretch gap-1 mt-4">
                    <NavItemButton
                        big
                        href={relativeUrl("/integrations")}
                        tooltip="Connect your project to external services"
                    >
                        <TbPuzzle />
                        Connected Accounts
                    </NavItemButton>
                    <NavItemButton
                        big
                        href={relativeUrl("/team")}
                        tooltip="Invite your team members to collaborate"
                    >
                        <TbUsers />
                        Team
                    </NavItemButton>
                    <NavItemButton
                        big
                        href={relativeUrl("/usage")}
                        tooltip="See your project's usage and upgrade your plan"
                    >
                        <TbChartLine />
                        Usage & Billing
                    </NavItemButton>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border">
                {children}
            </div>
        </div>
    )
}
