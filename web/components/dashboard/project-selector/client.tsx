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
import Kbd from "@web/components/Kbd"
import { useFromStore } from "@web/lib/queries/store"
import { cn, useCurrentProjectId } from "@web/lib/utils"
import _ from "lodash"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { TbCheck, TbChevronDown } from "react-icons/tb"


export default function ProjectSelectorClient({
    projects: passedProjects
}: {
    projects: { id: string, name: string }[]
}) {
    const projects = passedProjects.map(
        project => useFromStore(["projects", project.id], project)
    )

    const router = useRouter()
    const activeProjectId = useCurrentProjectId()

    const [open, setOpen] = useState(false)

    const goToProject = (id: string) => {
        if (id !== activeProjectId)
            router.push(`/projects/${id}`)
        setOpen(false)
    }

    useHotkeys("p", (ev) => {
        ev.preventDefault()
        setOpen(true)
    }, [setOpen])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-[220px] justify-between",
                        !activeProjectId && "text-muted-foreground"
                    )}
                >
                    {activeProjectId
                        ? projects.find((project) => project.id === activeProjectId)?.name
                        : "Select project..."}

                    <div className="flex items-center gap-2 shrink-0 text-sm text-muted-foreground">
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
                        {projects.map(project => (
                            <CommandItem
                                key={project.id}
                                value={project.id}
                                onSelect={currentValue => goToProject(currentValue)}
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
