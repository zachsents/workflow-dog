import type { NextFunction, Request, Response } from "express"
import express from "express"
import type { SessionData } from "express-session"
import session from "express-session"
import grant from "grant"
import morgan from "morgan"
import { addAccountToTeam, upsertIntegrationAccount } from "./db.js"
import serviceConfigs, { grantConfigs } from "./service-configs.js"


const port = process.env.PORT ? parseInt(process.env.PORT) : 8080


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */
const app = express()
app.use(morgan("dev"))
app.use(session({
    secret: "grant",
    resave: false,
    saveUninitialized: true,
}))

app.use("/connect", setTeamId)


/* -------------------------------------------------------------------------- */
/*                                 Grant Setup                                */
/* -------------------------------------------------------------------------- */

app.use(grant.default.express({
    defaults: {
        origin: process.env.NODE_ENV === "production" ?
            process.env.CLOUD_RUN_URL :
            `http://localhost:${port}`,
        transport: "session",
        response: ["tokens", "profile", "raw"],
    },
    ...grantConfigs,
}))


app.get("/finish/:serviceName", async (req, res) => {

    const session = req.session as CustomSessionData
    const { access_token, refresh_token, profile, raw: raw_token } = session.grant.response
    const serviceConfig = serviceConfigs[session.grant.provider]

    const account = await upsertIntegrationAccount({
        service_name: session.grant.provider,
        display_name: serviceConfig.getDisplayName(profile),
        service_user_id: serviceConfig.getServiceUserId(profile),
        access_token,
        refresh_token,
        profile,
        scopes: raw_token.scope?.split(/[\s,]+/) || [],
        raw_token,
    })

    await addAccountToTeam(account.id, session.team_id)

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

function setTeamId(req: Request, res: Response, next: NextFunction) {
    if (req.path.split("/").length > 2)
        return next()

    if (!req.query.t)
        res.status(400).send("Missing team ID")

    if (typeof req.query.t !== "string")
        res.status(400).send("Invalid team ID")

    const session = req.session as CustomSessionData
    session.team_id = req.query.t as string
    next()
}

interface CustomSessionData extends SessionData {
    team_id?: string,
    grant?: {
        provider: string,
        response: any,
    }
}