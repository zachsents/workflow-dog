"use client"

import { useUser } from "@web/modules/auth"
import ProjectCard from "./project-card"
import { useQuery } from "@tanstack/react-query"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import Loader from "@web/components/loader"

export default function ProjectsGrid() {

    const supabase = useSupabaseBrowser()
    const { data: user } = useUser()

    const { data: projects, isLoading } = useQuery({
        queryFn: async () => supabase
            .from("users")
            .select("teams!users_teams (id, name, created_at, users!users_teams (email))")
            .eq("id", user!.id)
            .single()
            .throwOnError()
            .then(q => q.data?.teams ?? []),
        queryKey: ["projectsForUser"],
        enabled: !!user?.id,
    })

    return isLoading
        ? <Loader className="w-full flex center my-8" />
        : <div className="grid grid-cols-3 gap-4">
            {projects?.map(project =>
                <ProjectCard project={project} key={project.id} />
            )}
        </div>
}