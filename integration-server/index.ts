import cookieSession from "cookie-session"
import type { NextFunction, Request, Response } from "express"
import express from "express"
import morgan from "morgan"
import passport from "passport"
import { setupStrategies } from "./passport.js"


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */

const app = express()
// app.set('trust proxy', 1)

await setupStrategies()

app.use(morgan("dev"))
app.use(cookieSession({
    // secret: await getSecret("INTEGRATION_SESSION_SECRET"),
    maxAge: 60 * 60 * 1000,
    signed: false,
    sameSite: "none",
}))
app.use(passport.initialize())
app.use(passport.session())


/* -------------------------------------------------------------------------- */
/*                                 Route Setup                                */
/* -------------------------------------------------------------------------- */

app.get(
    "/service/google/connect",
    setTeamId,
    (req, ...params) => passport.authenticate("google", {
        scope: [
            "profile",
            "email",
            ...parseScopes(req.query.scopes),
        ],
        accessType: "offline",
        includeGrantedScopes: true,
    })(req, ...params)
)

app.get(
    "/service/close/connect",
    setTeamId,
    (req, ...params) => passport.authenticate("oauth2", {
        accessType: "offline",
    })(req, ...params)
)

app.get(
    "/service/:serviceName/connect",
    setTeamId,
    (req, ...params) => passport.authenticate(req.params.serviceName, {
        // scope: ["profile", "email"],
    })(req, ...params)
)

app.get("/service/:serviceName/callback", echoTeamId, (req, ...params) => passport.authenticate(req.params.serviceName, {
    failureMessage: true,
    successRedirect: "/success",
    failWithError: true,
})(req, ...params))

app.get("/success", (req, res) => {
    res.send("<p>Integration successful! You can close this tab now.</p><script>window.close()</script>")
})


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080
app.listen(port, () => {
    console.log("Integration server running on port", port, `(${process.env.NODE_ENV})`)
})


/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

function setTeamId(req: Request, res: Response, next: NextFunction) {
    req.session.teamId = req.query.t
    next()
}

function echoTeamId(req: Request, res, next) {
    console.debug("Team ID:", req.session.teamId)
    next()
}

function parseScopes(scopes: any): string[] {
    const splitScopes = (str: string) => str.split(/[,\s]+/)

    if (Array.isArray(scopes))
        return scopes.flatMap(splitScopes)

    if (typeof scopes === "string")
        return splitScopes(scopes)

    return []
}