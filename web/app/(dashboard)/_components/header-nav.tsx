"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@ui/navigation-menu"
import Kbd from "@web/components/kbd"
import { useCurrentProjectId, useLocationHref } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import { TbChartBar, TbDots, TbPlugConnected, TbSettings, TbStar, TbUsers, TbVariable, TbVectorBezier2 } from "react-icons/tb"


export default function DashboardHeaderNav() {

    const isProjectSelected = !!useCurrentProjectId()

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {isProjectSelected && <>
                    <RegularNavLink
                        path="/workflows"
                        icon={<TbVectorBezier2 />}
                        shortcutKey="W"
                    >
                        Workflows
                    </RegularNavLink>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <NavigationMenuItem>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    <TbDots />
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="[&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:pl-4 [&_a]:pr-8 [&_a]:py-2"
                        >
                            <DropdownMenuLabel>
                                Project Settings
                            </DropdownMenuLabel>
                            <DropdownNavLink
                                path="/settings#general"
                                icon={<TbSettings />}
                                description="Project name, deletion, etc."
                            >
                                General
                            </DropdownNavLink>
                            <DropdownNavLink
                                path="/settings#team"
                                icon={<TbUsers />}
                                description="Invite team members"
                            >
                                Team
                            </DropdownNavLink>
                            <DropdownNavLink
                                path="/settings#integrations"
                                icon={<TbPlugConnected />}
                                description="Manage third-party services"
                            >
                                Integrations
                            </DropdownNavLink>
                            <DropdownNavLink
                                path="/#variables"
                                icon={<TbVariable />}
                                description="Coming soon"
                            >
                                Variables
                            </DropdownNavLink>

                            <DropdownMenuLabel>
                                Usage
                            </DropdownMenuLabel>
                            <DropdownNavLink
                                path="/usage"
                                icon={<TbStar />}
                                description="Upgrade your plan"
                            >
                                Upgrade
                            </DropdownNavLink>
                            <DropdownNavLink
                                path="/usage"
                                icon={<TbChartBar />}
                                description="See how many runs you have left"
                            >
                                Plan Usage
                            </DropdownNavLink>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>}
            </NavigationMenuList>
        </NavigationMenu>
    )
}


interface DropdownNavLinkProps {
    path: string
    children: React.ReactNode
    icon?: React.ReactNode
    description?: string
}

function DropdownNavLink({ path, children, icon, description }: DropdownNavLinkProps) {

    const currentProjectId = useCurrentProjectId()
    const href = `/projects/${currentProjectId}${path}`

    const active = useLocationHref()?.endsWith(path) || false

    return (
        <DropdownMenuItem asChild>
            <Link
                href={href}
                className="data-[active]:bg-slate-100 data-[active]:text-primary"
                data-active={active || null}
            >
                {icon}
                <div>
                    <p>{children}</p>
                    {description &&
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>}
                </div>
            </Link>
        </DropdownMenuItem>
    )
}


interface RegularNavLinkProps {
    path: string
    children: React.ReactNode
    /** Tied to conditional hook. Can't change. */
    shortcutKey?: string
    icon?: React.ReactNode
}

function RegularNavLink({ path, children, shortcutKey, icon }: RegularNavLinkProps) {

    const router = useRouter()

    const currentProjectId = useCurrentProjectId()
    const href = `/projects/${currentProjectId}${path}`

    const active = useLocationHref()?.endsWith(path) || false

    if (shortcutKey)
        useHotkeys(shortcutKey.toLowerCase(), () => router.push(href), {
            preventDefault: true,
        }, [router])

    return (
        <NavigationMenuItem>
            <Link href={href} legacyBehavior passHref>
                <NavigationMenuLink
                    active={active}
                    // {...active && { active: true }}
                    className={cn(
                        navigationMenuTriggerStyle(),
                        "flex center gap-2 data-[active]:bg-slate-100 data-[active]:text-primary"
                    )}
                >
                    {icon}
                    {children}
                    {shortcutKey &&
                        <Kbd>{shortcutKey}</Kbd>}
                </NavigationMenuLink>
            </Link>
        </NavigationMenuItem>
    )
}