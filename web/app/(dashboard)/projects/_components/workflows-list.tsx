"use client"

import { Skeleton } from "@web/components/ui/skeleton"
import { trpc } from "@web/lib/client/trpc"
import { NavItemButton } from "./project-nav"
import { Button } from "@web/components/ui/button"
import { TbPlus } from "react-icons/tb"

export default function WorkflowsList({ projectId }: { projectId: string }) {
    const { data: workflows } = trpc.workflows.list.useQuery({
        projectId,
    })

    return workflows
        ? workflows.length > 0
            ? workflows.map(w =>
                <NavItemButton
                    href={`/projects/${projectId}/workflows/${w.id}`}
                    key={w.id}
                >
                    {w.name}
                </NavItemButton>
            )
            : <Button size="sm" className="flex center gap-2 self-center">
                <TbPlus />
                Create a Workflow
            </Button>
        : <Skeleton className="h-[1rem]" />
}