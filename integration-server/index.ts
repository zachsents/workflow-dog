import type { NextFunction, Request, Response } from "express"
import express from "express"
import type { SessionData } from "express-session"
import session from "express-session"
import grant from "grant"
import morgan from "morgan"
import { addAccountToTeam, upsertIntegrationAccount } from "./db.js"
import serviceConfigs, { grantConfigs } from "./service-configs.js"
import cookieSession from "cookie-session"


const port = process.env.PORT ? parseInt(process.env.PORT) : 8080


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */
const app = express()
app.use(morgan("dev"))
app.use(cookieSession({
    signed: false,
    secure: false,
    maxAge: 5 * 60 * 1000,
}))


/* -------------------------------------------------------------------------- */
/*                                 Grant Setup                                */
/* -------------------------------------------------------------------------- */

app.use(grant.default.express({
    defaults: {
        origin: process.env.NODE_ENV === "production" ?
            process.env.CLOUD_RUN_URL :
            `http://localhost:${port}`,
        transport: "state",
        response: ["tokens", "profile", "raw"],
    },
    ...grantConfigs,
}))


app.get("/connect/:serviceName/callback", async (req, res) => {

    const session = req.session as CustomSessionData
    const { access_token, refresh_token, profile, raw: raw_token } = res.locals.grant.response
    const serviceConfig = serviceConfigs[req.params.serviceName]

    const account = await upsertIntegrationAccount({
        service_name: req.params.serviceName,
        display_name: serviceConfig.getDisplayName(profile),
        service_user_id: serviceConfig.getServiceUserId(profile),
        access_token,
        refresh_token,
        profile,
        scopes: raw_token.scope?.split(/[\s,]+/) || [],
        raw_token,
    })

    await addAccountToTeam(account.id, session.grant.dynamic.t)

    res.send("<p>Connected! You can close this tab now.</p><script>window.close()</script>")
})


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("Integration server running on port", port, `(${process.env.NODE_ENV})`)
})


/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

interface CustomSessionData extends SessionData {
    grant?: {
        provider: string,
        dynamic: {
            t: string,
        },
    }
}