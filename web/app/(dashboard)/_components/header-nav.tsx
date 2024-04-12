"use client"

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@ui/navigation-menu"
import { useCurrentProjectId } from "@web/lib/client/hooks"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import Kbd from "@web/components/kbd"


export default function DashboardHeaderNav() {

    const currentProjectId = useCurrentProjectId()
    const isProjectSelected = Boolean(currentProjectId)

    const relative = (href: string) => `/projects/${currentProjectId}${href}`

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    {isProjectSelected && <>
                        <NavLink href={relative("/workflows")} shortcut="W">Workflows</NavLink>
                        <NavLink href={relative("/usage")} shortcut="U">Usage</NavLink>
                        <NavLink href={relative("/settings")} shortcut="S">Settings</NavLink>
                    </>}
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

interface NavLinkProps {
    href: string
    children: any
    shortcut?: string
}

function NavLink({ href, children, shortcut }: NavLinkProps) {
    const pathname = usePathname()

    const router = useRouter()

    if (shortcut)
        useHotkeys(shortcut.toLowerCase(), ev => {
            ev.preventDefault()
            router.push(href)
        }, [router, href])

    return (
        <Link href={href} legacyBehavior passHref>
            <NavigationMenuLink
                active={pathname === href}
                className={navigationMenuTriggerStyle()}
            >
                {children}

                {shortcut &&
                    <Kbd className="ml-2">{shortcut}</Kbd>}
            </NavigationMenuLink>
        </Link>
    )
}