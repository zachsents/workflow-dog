import { errorResponse } from "@web/lib/server/router"
import { remapError, supabaseServer } from "@web/lib/server/supabase"
import _ from "lodash"
import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { ServiceDefinitions } from "packages/server"
import type { OAuth2Config } from "packages/types"
import { cleanToken, defaultOAuth2AccountConfig, fetchProfile, getOAuthClientForService, redirectUri } from "../_util"


export async function GET(
    req: NextRequest,
    { params: { serviceId: safeServiceId } }: { params: { serviceId: string } }
) {
    const searchParams = req.nextUrl.searchParams

    if (searchParams.has("error")) {
        console.error("Error connecting service:", searchParams.get("error"))
        return errorResponse(searchParams.get("error_description") || "Error connecting service", 400)
    }

    if (!searchParams.has("code"))
        return errorResponse("Missing code", 400)

    const cookieStore = cookies()
    const teamId = cookieStore.get("oauth_team")?.value
    if (!teamId)
        return errorResponse("Missing team ID", 400)

    const service = ServiceDefinitions.resolve(safeServiceId)

    if (!service)
        return errorResponse("Service not found", 404)

    const config = _.merge({}, defaultOAuth2AccountConfig, service.authAcquisition) as OAuth2Config

    if (config.state) {
        const cookieState = cookieStore.get("oauth_state")?.value
        const queryState = searchParams.get("state")

        if (!cookieState || !queryState || cookieState !== queryState)
            return errorResponse("Invalid state", 400)
    }

    const { clientId, clientSecret } = await getOAuthClientForService(service.id, true)

    const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: searchParams.get("code"),
            grant_type: "authorization_code",
            ...config.includeRedirectUriInTokenRequest && {
                redirect_uri: redirectUri(safeServiceId)
            },
        } as any).toString(),
    })

    if (!response.ok)
        return errorResponse(await response.text(), response.status)

    const { refresh_token, ...tokenObj } = cleanToken(await response.json())

    const profile = await fetchProfile(config.profileUrl, tokenObj.access_token)

    const supabase = supabaseServer()

    const insertQuery = await supabase
        .from("integration_accounts")
        .upsert({
            service_id: service.id,
            service_user_id: config.getServiceUserId(profile, tokenObj),
            display_name: config.getDisplayName(profile, tokenObj),
            profile,
            token: tokenObj,
            creator: await supabase.auth.getUser().then(u => u.data.user?.id),
            // adding this as a separate field so it doesn't get overwritten 
            // by other token updates
            ...refresh_token && { refresh_token },
        }, {
            onConflict: "service_id, service_user_id",
        })
        .select("id")
        .single()

    let error = remapError(insertQuery)
    if (error) return errorResponse(error.error.message, 500)

    const joinQuery = await supabase.from("integration_accounts_teams").upsert({
        integration_account_id: insertQuery.data?.id!,
        team_id: teamId,
    })

    error = remapError(joinQuery, {
        "42501": false,
        "23505": false,
    })
    if (error) return errorResponse(error.error.message, 500)

    return new Response("<p>Connected! You can close this tab now.</p><script>window.close()</script>", {
        headers: {
            "Content-Type": "text/html",
        },
    })
}


