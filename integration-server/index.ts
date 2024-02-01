import session from "cookie-session"
import type { NextFunction, Request, Response } from "express"
import express from "express"
import morgan from "morgan"
import passport from "passport"
import { setupStrategies } from "./passport.js"
import { getSecret } from "./secrets.js"


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */

const app = express()

app.use(morgan("dev"))
app.use(session({
    secret: await getSecret("INTEGRATION_SESSION_SECRET"),
}))
app.use(passport.initialize())
app.use(passport.session())

await setupStrategies()


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
    })(req, ...params)
)

app.get(
    "/service/:serviceName/connect",
    setTeamId,
    (req, ...params) => passport.authenticate(req.params.serviceName, {
        // scope: ["profile", "email"],
    })(req, ...params)
)

app.get("/service/:serviceName/callback", (req, ...params) => passport.authenticate(req.params.serviceName, {
    failureMessage: "Failed to authorize integration. Please try again.",
    successRedirect: "/success",
})(req, ...params))

app.get("/success", (req, res) => {
    res.send("<p>Integration successful! You can close this tab now.</p><script>window.close()</script>")
})


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080
app.listen(port, () => {
    console.log("Integration server running on port", port)
})


/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

function setTeamId(req: Request, res: Response, next: NextFunction) {
    req.session.teamId = req.query.t
    next()
}


function parseScopes(scopes: any): string[] {
    const splitScopes = str => str.split(/[,\s]+/)

    if (Array.isArray(scopes))
        return scopes.flatMap(splitScopes)

    if (typeof scopes === "string")
        return splitScopes(scopes)

    return []
}