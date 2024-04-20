import { ServiceDefinitions } from "@pkg/server"
import { TypedSupabaseClient } from "../types/supabase"
import { getTokenForOAuth2Account } from "@web/app/api/oauth2/connect/[serviceId]/_util"
import { CodedError } from "../utils"

export async function getServiceAccountToken(supabase: TypedSupabaseClient, accountId: string) {

    const { data: account } = await supabase
        .from("integration_accounts")
        .select("*")
        .eq("id", accountId)
        .single()
        .throwOnError()

    if (!account)
        throw new CodedError("Account not found", 404)

    const service = ServiceDefinitions.get(account.service_id!)

    if (!service)
        throw new CodedError("Service not found", 404)

    switch (service.authAcquisition.method) {
        case "oauth2":
            return getTokenForOAuth2Account(account, supabase)
        case "key":
            return { key: (account.token as any)?.key }
        default:
            return account.token
    }
}