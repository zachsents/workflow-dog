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
import { useCurrentProjectId } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import { TbChartBar, TbDots, TbPlugConnected, TbSettings, TbUsers, TbVectorBezier2 } from "react-icons/tb"


export default function DashboardHeaderNav() {

    const currentProjectId = useCurrentProjectId()
    const isProjectSelected = Boolean(currentProjectId)

    const router = useRouter()
    const pathname = usePathname()

    const relative = (href: string) => `/projects/${currentProjectId}${href}`
    const pushRelative = (href: string) => router.push(relative(href))

    useHotkeys("w", () => pushRelative("/workflows"), {
        preventDefault: true,
    }, [router])

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {isProjectSelected && <>
                    <NavigationMenuItem>
                        <Link href={relative("/workflows")} legacyBehavior passHref>
                            <NavigationMenuLink
                                active={pathname === "/workflows"}
                                className={cn("flex center gap-2", navigationMenuTriggerStyle())}
                            >
                                <TbVectorBezier2 />
                                Workflows
                                <Kbd>W</Kbd>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>

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
                                Settings
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={relative("/settings#general")}>
                                    <TbSettings />
                                    General Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={relative("/usage")}>
                                    <TbChartBar />
                                    Usage & Billing
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={relative("/settings#team")}>
                                    <TbUsers />
                                    Team
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={relative("/settings#integrations")}>
                                    <TbPlugConnected />
                                    Integrations
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
