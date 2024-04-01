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
import { useCurrentProjectId, useDialogState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useProjectsForUser } from "@web/modules/projects"
import { useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"
import { TbCheck, TbChevronDown } from "react-icons/tb"


export default function ProjectSelector() {

    const { data: projects } = useProjectsForUser()

    const popover = useDialogState()

    const activeProjectId = useCurrentProjectId()
    const router = useRouter()
    const goToProject = (projectId: string) => () => {
        if (activeProjectId !== projectId)
            router.push(`/projects/${projectId}`)
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
                    <span>
                        {activeProjectId
                            ? projects?.find((project) => project.id === activeProjectId)?.name
                            : "Select project..."}
                    </span>

                    <div className="flex center gap-2 shrink-0 text-sm text-muted-foreground">
                        <Kbd>P</Kbd>
                        <TbChevronDown />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
                <Command>
                    <CommandInput placeholder="Search project..." />
                    <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        {projects?.map(project => (
                            <CommandItem
                                key={project.id}
                                value={project.name}
                                onSelect={goToProject(project.id)}
                            >
                                <TbCheck
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        activeProjectId === project.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                                {project.name}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
