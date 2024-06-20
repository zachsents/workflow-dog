"use client"

import Loader from "@web/components/loader"
import SearchInput from "@web/components/search-input"
import { useSearch } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import ProjectCard from "./project-card"

export default function ProjectsGrid() {

    const { data: projects, isLoading } = trpc.projects.list.useQuery()

    const search = useSearch(projects ?? [], {
        keys: ["name"],
    })

    return isLoading
        ? <Loader className="w-full flex center my-8" />
        : (projects && projects?.length > 0)
            ? <>
                <SearchInput
                    value={search.query}
                    onValueChange={search.setQuery}
                    quantity={projects?.length}
                    noun="project"
                    withHotkey
                />
                <div className="grid grid-cols-3 gap-4">
                    {search.filtered.map(project =>
                        <ProjectCard project={project} key={project.id} />
                    )}
                </div>
            </>
            : <p className="text-center py-8 text-sm text-muted-foreground">
                No projects found
            </p>
}