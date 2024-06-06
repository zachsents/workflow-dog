import type { OAuth2Config } from "@pkg/types/server"
import { db } from "@web/lib/server/db"
import { cleanToken, fetchProfile, oauth2RedirectUrl } from "@web/lib/server/internal/service-accounts"
import { errorResponse, requireLogin } from "@web/lib/server/router"
import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { ServiceDefinitions } from "packages/server"


export async function GET(
    req: NextRequest,
    { params: { serviceId: serviceDefId } }: { params: { serviceId: string } }
) {
    const session = await requireLogin()

    const params = req.nextUrl.searchParams

    if (params.has("error")) {
        console.error("Error connecting service:", params.get("error"))
        return errorResponse(params.get("error_description") || "Error connecting service", 400)
    }

    if (!params.has("code"))
        return errorResponse("Missing code", 400)

    const cookieStore = cookies()
    const projectId = cookieStore.get("oauth_project")?.value
    if (!projectId)
        return errorResponse("Missing team ID", 400)

    const serviceDef = ServiceDefinitions.get(serviceDefId)

    if (!serviceDef)
        return errorResponse("Service not found", 404)

    const oauthConfig = (serviceDef as any).oauth2Config as OAuth2Config

    if (oauthConfig.state) {
        const cookieState = cookieStore.get("oauth_state")?.value
        const queryState = params.get("state")

        if (!cookieState || !queryState || cookieState !== queryState)
            return errorResponse("Invalid state", 400)
    }

    const response = await fetch(oauthConfig.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
        body: new URLSearchParams({
            client_id: oauthConfig.clientId,
            client_secret: oauthConfig.clientSecret,
            code: params.get("code")!,
            grant_type: "authorization_code",
            ...oauthConfig.includeRedirectUriInTokenRequest && {
                redirect_uri: oauth2RedirectUrl(serviceDefId)
            },
        }).toString(),
    })

    if (!response.ok)
        return errorResponse(await response.text(), response.status)

    const {
        refresh_token,
        ...tokenObj
    } = cleanToken(await response.json(), oauthConfig.scopeDelimiter)

    const profile = await fetchProfile(oauthConfig.profileUrl, tokenObj.access_token)

    const accountData = {
        service_id: serviceDefId,
        service_user_id: oauthConfig.getServiceUserId(profile, tokenObj),
        display_name: oauthConfig.getDisplayName(profile, tokenObj),
        profile,
        token: tokenObj,
        creator: session.user_id,
        // adding this as a separate field so it doesn't get overwritten 
        // by other token updates
        ...refresh_token && { refresh_token },
    }

    await db.transaction().execute(async trx => {

        const existingAccount = await trx.selectFrom("service_accounts")
            .select("id")
            .where("service_def_id", "=", serviceDefId)
            .where("service_user_id", "=", accountData.service_user_id)
            .executeTakeFirst()

        const newAccount = await (existingAccount
            ? trx.updateTable("service_accounts")
                .set(accountData)
                .where("id", "=", existingAccount.id)
                .returning("id")
                .executeTakeFirstOrThrow()
            : trx.insertInto("service_accounts")
                .values(accountData)
                .returning("id")
                .executeTakeFirstOrThrow())

        await trx.insertInto("projects_service_accounts")
            .values({
                project_id: projectId,
                service_account_id: newAccount.id,
            })
            .executeTakeFirstOrThrow()
    })

    return new Response("<p>Connected! You can close this tab now.</p><script>window.close()</script>", {
        headers: {
            "Content-Type": "text/html",
        },
    })
}


