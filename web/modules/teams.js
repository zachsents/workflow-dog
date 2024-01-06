import { useQuery } from "@tanstack/react-query"
import { useUser } from "./auth"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"


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


