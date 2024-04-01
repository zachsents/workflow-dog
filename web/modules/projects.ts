import { useSupabaseBrowser } from "@web/lib/client/supabase"
import { useUser } from "./auth"
import { useQuery } from "@tanstack/react-query"


export function useProjectsForUser() {
    const supabase = useSupabaseBrowser()
    const { data: user } = useUser()
    return useQuery({
        queryFn: async () => supabase
            .from("users")
            .select("teams!users_teams (id,name)")
            .eq("id", user!.id)
            .single()
            .throwOnError()
            .then(q => q.data?.teams ?? []),
        queryKey: ["projectsForUser", user?.id],
        enabled: !!user?.id,
    })
}
