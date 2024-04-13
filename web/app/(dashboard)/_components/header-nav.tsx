"use client"

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@ui/navigation-menu"
import Kbd from "@web/components/kbd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { useCurrentProjectId } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import { TbChartBar, TbSettings, TbVectorBezier2 } from "react-icons/tb"


export default function DashboardHeaderNav() {

    const currentProjectId = useCurrentProjectId()
    const isProjectSelected = Boolean(currentProjectId)

    const relative = (href: string) => `/projects/${currentProjectId}${href}`

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {isProjectSelected && <>
                    <NavLink href={relative("/workflows")} shortcut="W" icon={TbVectorBezier2}>
                        Workflows
                    </NavLink>
                    <NavLink href={relative("/usage")} shortcut="U" icon={TbChartBar}>
                        Usage
                    </NavLink>
                    <NavLink href={relative("/settings")} shortcut="S" icon={TbSettings}>
                        Settings
                    </NavLink>
                </>}
            </NavigationMenuList>
        </NavigationMenu>
    )
}

interface NavLinkProps {
    href: string
    children: any
    shortcut?: string
    icon?: React.ComponentType
    iconOnly?: boolean
}

function NavLink({ href, children, shortcut, icon: Icon, iconOnly }: NavLinkProps) {
    const pathname = usePathname()

    const router = useRouter()

    if (shortcut)
        useHotkeys(shortcut.toLowerCase(), ev => {
            ev.preventDefault()
            router.push(href)
        }, [router, href])

    const navItemComponent =
        <NavigationMenuItem>
            <Link href={href} legacyBehavior passHref>
                <NavigationMenuLink
                    active={pathname === href}
                    className={cn(
                        "flex center gap-2",
                        navigationMenuTriggerStyle()
                    )}
                >
                    {Icon &&
                        <Icon />}
                    {iconOnly ? null : children}
                    {shortcut &&
                        <Kbd>{shortcut}</Kbd>}
                </NavigationMenuLink>
            </Link>
        </NavigationMenuItem>

    return iconOnly
        ? <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {navItemComponent}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>{children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        : navItemComponent
}