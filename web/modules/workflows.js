import { useMutation, useQuery } from "@tanstack/react-query"
import { useQueryParam } from "./router"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"
import { useUser } from "./auth"


export function useWorkflowsForTeam(teamId, selectKeys = ["*"]) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data: { workflows } } = await supabase
                .from("teams")
                .select(`workflows (${selectKeys.join(",")})`)
                .eq("id", teamId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(workflows)
        },
        queryKey: ["workflowsForTeam", teamId, selectKeys],
        enabled: !!teamId,
    })
}


export function useWorkflow(workflowId) {
    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("workflows")
                .select("*")
                .eq("id", workflowId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["workflow", workflowId],
        enabled: !!workflowId,
    })
}


/**
 * TO DO: change to API endpoint so we can:
 * - create associated version, trigger, etc.
 * - do property validation w/ something like zod/joi
 * 
 * Also need to figure out how to make default select from metadata table
 */
export function useCreateWorkflow() {

    const { data: user } = useUser()
    const [teamId] = useQueryParam("team")

    return useMutation({
        mutationFn: async ({ name, trigger }) => {
            if (!user?.id || !teamId)
                return console.warn("User or team not set")

            const { data } = await supabase
                .from("workflows")
                .insert({
                    name,
                    team: teamId,
                    trigger: { type: trigger },
                    creator: user.id,
                })
                .select("id")
                .single()
                .throwOnError()
            return deepCamelCase(data)
        }
    })
}