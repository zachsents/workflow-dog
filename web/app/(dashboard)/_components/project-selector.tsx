"use client"

import { Button } from "@ui/button"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList
} from "@ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@ui/popover"
import Kbd from "@web/components/kbd"
import { Badge } from "@web/components/ui/badge"
import { useCurrentProjectId, useDialogState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { PlanData } from "@web/modules/plans"
import { useProjectsForUser } from "@web/modules/projects"
import { usePathname, useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import { TbCheck, TbChevronDown } from "react-icons/tb"


export default function ProjectSelector() {

    const { data: projects } = useProjectsForUser()

    const popover = useDialogState()

    const activeProjectId = useCurrentProjectId()
    const router = useRouter()
    const pathname = usePathname()
    const goToProject = (projectId: string) => () => {
        if (activeProjectId !== projectId) {
            const route = pathname.split("/").slice(3).join("/")
            router.push(`/projects/${projectId}/${route}`)
        }
        popover.close()
    }

    useHotkeys("p", popover.open, {
        preventDefault: true,
    }, [])

    return (
        <Popover {...popover.dialogProps}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popover.isOpen}
                    className={cn(
                        "w-[220px] justify-between",
                        !activeProjectId && "text-muted-foreground"
                    )}
                >
                    <span className="truncate">
                        {activeProjectId
                            ? projects?.find((project) => project.id === activeProjectId)?.name
                            : "Select projects..."}
                    </span>

                    <div className="flex center gap-2 shrink-0 text-sm text-muted-foreground">
                        <Kbd>P</Kbd>
                        <TbChevronDown />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[260px] p-0">
                <Command>
                    <CommandInput placeholder="Search project..." />
                    <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        {projects?.map(project => {

                            const plan = PlanData[project.billing_plan || "free"]

                            return (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={goToProject(project.id)}
                                    className="flex between py-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <TbCheck
                                            className={activeProjectId === project.id
                                                ? "opacity-100"
                                                : "opacity-0"}
                                        />
                                        {project.name}
                                    </div>

                                    <Badge className={cn(plan.badgeClassName, "pointer-events-none")}>
                                        {plan.name}
                                    </Badge>
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
