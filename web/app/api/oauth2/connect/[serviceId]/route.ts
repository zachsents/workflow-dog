import { errorResponse } from "@web/lib/server/router"
import { randomBytes } from "crypto"
import _ from "lodash"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { ServiceDefinitions } from "packages/server"
import type { OAuth2Config } from "packages/types"
import { defaultOAuth2AccountConfig, getOAuthClientForService, redirectUri } from "./_util"


export async function GET(
    req: NextRequest,
    { params: { serviceId: safeServiceId } }: { params: { serviceId: string } }
) {
    const searchParams = req.nextUrl.searchParams
    const service = ServiceDefinitions.resolve(safeServiceId)

    if (!service)
        return errorResponse("Service not found", 404)

    const teamId = searchParams.get("t") as string
    if (!teamId)
        return errorResponse("Missing team ID", 400)

    const cookieStore = cookies()
    cookieStore.set("oauth_team", teamId)

    const oauthConfig = _.merge({}, defaultOAuth2AccountConfig, service.authAcquisition) as OAuth2Config

    const { clientId } = await getOAuthClientForService(service.id, false)

    const url = new URL(oauthConfig.authUrl)
    url.searchParams.append("client_id", clientId)
    url.searchParams.append("redirect_uri", redirectUri(req.nextUrl.host, safeServiceId))
    url.searchParams.append("response_type", "code")

    const scopes = Array.from(new Set(
        oauthConfig.allowAdditionalScopes
            ? [
                ...oauthConfig.scopes,
                ...((searchParams.get("scopes") as string)
                    ?.split(/[\s,]+/) || [])
            ]
            : oauthConfig.scopes
    ))
    url.searchParams.set("scope", scopes.join(oauthConfig.scopeDelimiter))

    if (oauthConfig.state === true)
        url.searchParams.set("state", randomBytes(20).toString("hex"))
    else if (typeof oauthConfig.state === "number")
        url.searchParams.set("state", randomBytes(oauthConfig.state).toString("hex"))
    else if (oauthConfig.state === "request")
        url.searchParams.set("state", searchParams.get("state") as string)
    else if (typeof oauthConfig.state === "string")
        url.searchParams.set("state", oauthConfig.state)

    if (url.searchParams.get("state"))
        cookieStore.set("oauth_state", url.searchParams.get("state")!)

    if (oauthConfig.additionalParams) {
        Object.entries(oauthConfig.additionalParams).forEach(([key, value]) => {
            url.searchParams.set(key, value as string)
        })
    }

    if (oauthConfig.allowAdditionalParams) {
        Array.from(searchParams.entries())
            .filter(([key]) => {
                if (["t", "scopes", "state", "redirect_uri", "scope", "response_type", "client_id", "code"].includes(key))
                    return false

                if (Array.isArray(oauthConfig.allowAdditionalParams))
                    return oauthConfig.allowAdditionalParams.includes(key)

                return true
            })
            .forEach(([key, value]) => {
                url.searchParams.set(key, value)
            })
    }

    return NextResponse.redirect(url.toString())
}


