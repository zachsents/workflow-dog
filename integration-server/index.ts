import session from "cookie-session"
import "dotenv/config"
import type { NextFunction, Request, Response } from "express"
import express from "express"
import morgan from "morgan"
import passport from "passport"
import { setupStrategies } from "./passport.js"
import { getSecret } from "./secrets.js"


const app = express()

app.use(morgan("dev"))
app.use(session({
    secret: await getSecret("INTEGRATION_SESSION_SECRET"),
    // cookie: {},
    // resave: false,
    // saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

await setupStrategies()


app.get(
    "/integration/google/connect",
    setTeamId,
    (req, ...params) => passport.authenticate("google", {
        scope: [
            "profile",
            "email",
            ...((Array.isArray(req.query.scopes) ? req.query.scopes : [req.query.scopes])
                .flatMap(scope => (scope as string).split(/[,\s]+/)))
        ],
        accessType: "offline",
    })(req, ...params)
)


app.get(
    "/integration/:serviceName/connect",
    setTeamId,
    (req, ...params) => passport.authenticate(req.params.serviceName, {
        // scope: ["profile", "email"],
    })(req, ...params)
)


app.get("/integration/:serviceName/callback", (req, ...params) => passport.authenticate(req.params.serviceName, {
    failureMessage: "Failed to authorize integration. Please try again.",
    successRedirect: "/integration/success",
})(req, ...params))


app.get("/integration/success", (req, res) => {
    res.send("<p>Integration successful! You can close this tab now.</p><script>window.close()</script>")
})


const port = 8000
app.listen(port, () => {
    console.log("Integration server running on port", port)
})


function setTeamId(req: Request, res: Response, next: NextFunction) {
    req.session.teamId = req.query.t
    next()
}
