"use client"

import SimpleTooltip from "@web/components/simple-tooltip"
import { cn } from "@web/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TbBook, TbExternalLink, TbPlus } from "react-icons/tb"


export function NavSectionHeader({ children, icon, href, learnAbout }: {
    children: any,
    icon: React.ReactNode,
    href: string,
    learnAbout: string
}) {
    const btnClasses = "aspect-square p-2 hover:bg-slate-400/50 rounded-sm text-muted-foreground"

    return (
        <div className="flex justify-between items-center gap-2 text-sm pl-2">
            {icon}
            <span className="grow">
                {children}
            </span>
            <div className="flex items-center gap-1">
                <SimpleTooltip tooltip="Create a new Workflow">
                    <button className={btnClasses}>
                        <TbPlus />
                    </button>
                </SimpleTooltip>
                <SimpleTooltip tooltip={
                    <div className="flex place-items-center gap-2">
                        <span>{`Learn about ${learnAbout}`}</span>
                        <TbExternalLink />
                    </div>
                }>
                    <a className={btnClasses} href={href} target="_blank">
                        <TbBook />
                    </a>
                </SimpleTooltip>
            </div>
        </div>
    )
}


export function NavItemButton({ children, href, big, tooltip }: {
    children: any
    href: string
    big?: boolean
    tooltip?: string
}) {

    const pathname = usePathname()
    const isActive = pathname === href

    const linkComp =
        <Link
            href={href}
            className={cn(
                "text-sm text-left truncate rounded-sm px-2 py-1 flex items-center gap-2",
                isActive
                    ? "text-violet-700 bg-violet-300/50 font-bold"
                    : "hover:bg-slate-400/30",
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