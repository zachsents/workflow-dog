import { Suspense } from "react"
import ProjectSelectorClient from "./client"
import { Button } from "@ui/button"
import { supabaseServer } from "@web/lib/server/supabase"
import { FromStore } from "@web/lib/queries/store"


export default async function ProjectSelector() {
    return (
        <Suspense fallback={
            <Button
                variant="outline"
                role="combobox"
                disabled
                className="w-[220px] justify-between text-muted-foreground"
            >
                Loading projects...
            </Button>
        }>
            <ProjectSelectorLoader />
        </Suspense>
    )
}


async function ProjectSelectorLoader() {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
        .from("users")
        .select("teams!users_teams (id,name)")
        .eq("id", user!.id)
        .single()
        .throwOnError()

    const projects = data?.teams ?? []
    return <ProjectSelectorClient projects={projects} />
}