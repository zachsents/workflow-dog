import { useQuery } from "@tanstack/react-query"
import { useUser } from "./auth"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useQueryParam } from "./router"
import _ from "lodash"


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
            return {
                roles,
                isEditor: roles.includes("editor"),
                isViewer: roles.includes("viewer"),
            }
        },
        queryKey: ["teamRole", userId, teamId],
        enabled: !!teamId && !!userId,
    })
}


export function useTeam(teamId) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("teams")
                .select("*")
                .eq("id", teamId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["team", teamId],
        enabled: !!teamId,
    })
}


export function useTeamMembers(teamId) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const keyMap = {
                member_id: "id",
                member_email: "email",
                member_roles: "roles",
            }

            const { data } = await supabase.rpc("get_team_members", { team_id_arg: teamId })

            return data.map(member => _.mapKeys(member, (v, k) => keyMap[k] ?? k))
        },
        queryKey: ["teamMembers", teamId],
        enabled: !!teamId,
    })
}


export function isEditor(roles) {
    return roles?.includes("editor")
}

export function isViewer(roles) {
    return roles?.includes("viewer")
}