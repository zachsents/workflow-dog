import { Button } from "@ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover"
import Kbd from "@web/components/kbd"
import { Badge } from "@web/components/ui/badge"
import { useCurrentProjectId, useDialogState } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { getPlanInfo } from "@web/lib/plans"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import { cn } from "@web/lib/utils"
import { useMemo } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useLocation, useNavigate } from "react-router-dom"
import TI from "./tabler-icon"


export default function ProjectSelector() {

    const { data: projects, isLoading } = trpc.projects.list.useQuery()

    const currentProjectId = useCurrentProjectId()
    const location = useLocation()
    const currentSegment = useMemo(() => location.pathname.match(/projects\/[\w-]+(\/.+)$/)?.[1] ?? "", [location.pathname])
    const navigate = useNavigate()

    const popover = useDialogState()

    useHotkeys("p", popover.open, {
        preventDefault: true,
    })

    return (
        <Popover {...popover.dialogProps}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox" aria-expanded={popover.isOpen}
                    className={cn(
                        "w-[360px] justify-between gap-4 h-auto py-2",
                        !currentProjectId && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                >
                    {currentProjectId ? <p className="text-xs text-muted-foreground">
                        Current Project
                    </p> : null}

                    <p className="truncate grow text-left">
                        {isLoading
                            ? "Loading projects..."
                            : currentProjectId
                                ? (projects!.find(p => p.id === currentProjectId)?.name ?? "Unknown project")
                                : "Select projects..."}
                    </p>

                    <div className="flex-center gap-2 shrink-0 text-sm text-muted-foreground">
                        <Kbd>P</Kbd>
                        <TI><IconChevronDown /></TI>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[360px] p-0">
                <Command>
                    <CommandInput placeholder="Search project..." />
                    <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        {projects?.map(project => {
                            const plan = getPlanInfo(project.billing_plan)
                            const href = `/projects/${project.id}${currentSegment}`
                            return (
                                <CommandItem
                                    key={project.id}
                                    value={project.name!}
                                    onSelect={() => {
                                        popover.close()
                                        navigate(href)
                                    }}
                                    asChild
                                    className="flex-center gap-2 py-3"
                                >
                                    <a
                                        // still shows link but prefers soft navigation
                                        href={href} onClick={e => e.preventDefault()}
                                    >
                                        <TI className={cn("shrink-0", currentProjectId !== project.id && "opacity-0")}>
                                            <IconCheck />
                                        </TI>
                                        <p className="grow text-wrap">
                                            {project.name}
                                        </p>
                                        <Badge className={cn(plan.badgeClassName, "shrink-0 pointer-events-none shadow-none")}>
                                            {plan.name}
                                        </Badge>
                                    </a>
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
