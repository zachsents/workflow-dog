"use client"

import Loader from "@web/components/loader"
import { trpc } from "@web/lib/client/trpc"
import ProjectCard from "./project-card"

export default function ProjectsGrid() {

    const { data: projects, isLoading } = trpc.projects.list.useQuery()

    return isLoading
        ? <Loader className="w-full flex center my-8" />
        : <div className="grid grid-cols-3 gap-4">
            {projects?.map(project =>
                <ProjectCard project={project} key={project.id} />
            )}
        </div>
}