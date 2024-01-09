import { useQuery } from "@tanstack/react-query"
import { useUser } from "./auth"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useQueryParam } from "./router"


export function useTeamsForUser(userId, selectKeys = ["*"]) {

    const { data: user } = useUser()
    userId ??= user?.id

    return useQuery({
        queryFn: async () => {
            const { data: { teams } } = await supabase
                .from("users")
                .select(`teams!users_teams (${selectKeys.join(",")})`)
                .eq("id", userId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(teams)
        },
        queryKey: ["teamsForUser", userId, selectKeys],
        enabled: !!userId,
    })
}


export function useTeamRoles(userId, teamId) {

    const { data: user } = useUser()
    userId ??= user?.id

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data: { roles } } = await supabase
                .from("users_teams")
                .select("roles")
                .eq("user_id", userId)
                .eq("team_id", teamId)
                .limit(1)
                .single()
                .throwOnError()
            return roles
        },
        queryKey: ["teamRole", userId, teamId],
        enabled: !!teamId && !!userId,
    })
}
