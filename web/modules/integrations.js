import { FcGoogle } from "react-icons/fc"
import { TbBrandAirtable, TbBrandDiscordFilled, TbBrandLinkedin, TbBrandStripe, TbBrandXFilled } from "react-icons/tb"
import { INTEGRATION_SERVICE, INTEGRATION_INFO as SHARED_INTEGRATION_INFO } from "shared/integrations"
import { useQueryParam } from "./router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"


export const INTEGRATION_INFO = {
    [INTEGRATION_SERVICE.GOOGLE]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.GOOGLE],
        icon: FcGoogle,
        color: "blue",
    },
    [INTEGRATION_SERVICE.LINKEDIN]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.LINKEDIN],
        icon: TbBrandLinkedin,
        color: "blue",
    },
    [INTEGRATION_SERVICE.X]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.X],
        icon: TbBrandXFilled,
        color: "gray",
        shade: 900,
    },
    [INTEGRATION_SERVICE.DISCORD]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.DISCORD],
        icon: TbBrandDiscordFilled,
        color: "violet",
    },
    [INTEGRATION_SERVICE.STRIPE]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.STRIPE],
        icon: TbBrandStripe,
        color: "purple",
    },
    [INTEGRATION_SERVICE.AIRTABLE]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.AIRTABLE],
        icon: TbBrandAirtable,
        color: "yellow",
        shade: 400,
    },
}


export function useIntegrationAccountsForTeam(teamId, selectKeys = ["*"]) {

    const [teamIdParam] = useQueryParam("team")
    teamId ??= teamIdParam

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("teams")
                .select(`integration_accounts (${selectKeys.join(",")})`)
                .eq("id", teamId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data.integration_accounts)
        },
        queryKey: ["integrationAccountsForTeam", teamId, selectKeys],
        enabled: !!teamId,
    })
}


export function useIntegrationAccount(integrationAccountId) {
    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("integration_accounts")
                .select("*")
                .eq("id", integrationAccountId)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["integrationAccount", integrationAccountId],
        enabled: !!integrationAccountId,
    })
}