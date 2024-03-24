import { Button } from "@ui/button"
import ProjectCard from "./_components/project-card"
import { supabaseServer } from "@web/lib/server/supabase"
import { TbPlus } from "react-icons/tb"


export default async function ProjectsPage() {

    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
        .from("users")
        .select("teams!users_teams (id, name, created_at, users!users_teams (email))")
        .eq("id", user!.id)
        .single()
        .throwOnError()

    const projects = data?.teams ?? []

    return (<>
        <div className="flex justify-between gap-10">
            <h1 className="text-2xl font-bold">
                Projects
            </h1>

            <Button>
                <TbPlus className="mr-2" />
                Create Project
            </Button>
        </div>

        <div className="grid grid-cols-3">
            {projects.map(project =>
                <ProjectCard project={project} key={project.id} />
            )}
        </div>
    </>)
}