import { ServiceDefinitions } from "@pkg/server"
import { type OAuth2Config } from "@pkg/types/server"
import { oauth2RedirectUrl } from "@web/lib/server/internal/service-accounts"
import { errorResponse } from "@web/lib/server/router"
import { randomBytes } from "crypto"
import _ from "lodash"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { type NextRequest } from "next/server"


export async function GET(
    req: NextRequest,
    { params: { serviceId: serviceDefId } }: { params: { serviceId: string } }
) {
    const params = req.nextUrl.searchParams

    const serviceDef = ServiceDefinitions.get(serviceDefId)
    if (!serviceDef)
        return errorResponse("Service not found", 404)

    const projectId = params.get("p") as string
    if (!projectId)
        return errorResponse("Missing project ID", 400)

    const cookieStore = cookies()
    cookieStore.set("oauth_project", projectId)

    const oauthConfig = (serviceDef as any).oauth2Config as OAuth2Config

    const url = new URL(oauthConfig.authUrl)
    url.searchParams.append("client_id", oauthConfig.clientId)
    url.searchParams.append("redirect_uri", oauth2RedirectUrl(serviceDefId))
    url.searchParams.append("response_type", "code")

    const passedScopes = (oauthConfig.allowAdditionalScopes && params.has("scopes"))
        ? params.get("scopes")!.split(/[\s,]+/)
        : []

    const scopes = Array.from(new Set([...oauthConfig.scopes, ...passedScopes]))
    url.searchParams.set("scope", scopes.join(oauthConfig.scopeDelimiter))

    if (oauthConfig.state === true)
        url.searchParams.set("state", randomBytes(20).toString("hex"))
    else if (typeof oauthConfig.state === "number")
        url.searchParams.set("state", randomBytes(oauthConfig.state).toString("hex"))
    else if (oauthConfig.state === "request")
        url.searchParams.set("state", params.get("state") as string)
    else if (typeof oauthConfig.state === "string")
        url.searchParams.set("state", oauthConfig.state)

    if (url.searchParams.get("state"))
        cookieStore.set("oauth_state", url.searchParams.get("state")!)

    if (oauthConfig.additionalParams) {
        Object.entries(oauthConfig.additionalParams).forEach(([k, v]) => {
            url.searchParams.set(k, v)
        })
    }

    if (oauthConfig.allowAdditionalParams) {
        const cleanedParams = _.omit(
            Object.fromEntries(params.entries()),
            ["t", "scopes", "state", "redirect_uri", "scope", "response_type", "client_id", "code"]
        )

        const paramObj = Array.isArray(oauthConfig.allowAdditionalParams)
            ? _.pick(cleanedParams, oauthConfig.allowAdditionalParams)
            : cleanedParams

        _.mapValues(paramObj, (v, k) => void url.searchParams.set(k, v))
    }

    return redirect(url.toString())
}


