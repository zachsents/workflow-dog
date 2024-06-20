"use client"

import { trpc } from "@web/lib/client/trpc"
import Loader from "@web/components/loader"
import { Skeleton } from "@web/components/ui/skeleton"

export default function ProjectOverviewPage({
    params: { projectId },
}: {
    params: { projectId: string }
}) {

    const { data: project, isLoading } = trpc.projects.byId.useQuery({ id: projectId })

    return (
        <div>
            <p className="text-sm font-bold text-muted-foreground uppercase mb-1">
                Project Overview
            </p>

            <div className="text-2xl">
                {project
                    ? <p>{project.name}</p>
                    : <Skeleton className="h-[1.5em]" />}
            </div>
        </div>
    )
}
