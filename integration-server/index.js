import "dotenv/config"
import express from "express"
import session from "express-session"
import morgan from "morgan"
import passport from "passport"
import { setupStrategies } from "./passport.js"
import { getSecret } from "./secrets.js"


const app = express()

app.use(morgan("dev"))
app.use(session({
    secret: await getSecret("INTEGRATION_SESSION_SECRET"),
    cookie: {},
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

await setupStrategies()


app.get("/integration/google/connect", setTeamId, (req, ...params) => passport.authenticate("google", {
    scope: ["profile", "email", ...(req.query.scopes?.split(/[,\s]+/) || [])],
    accessType: "offline",
})(req, ...params))


app.get("/integration/:serviceName/connect", setTeamId, (req, ...params) => passport.authenticate(req.params.serviceName, {
    // scope: ["profile", "email"],
})(req, ...params))


app.get("/integration/:serviceName/callback", (req, ...params) => passport.authenticate(req.params.serviceName, {
    failureMessage: "Failed to authorize integration. Please try again.",
    successRedirect: "/integration/success",
})(req, ...params))


app.get("/integration/success", (req, res) => {
    res.send("Integration successful! You can close this tab now.")
})

app.listen(8080, () => {
    console.log("Integration server is running on port 8080")
})


function setTeamId(req, res, next) {
    req.session.teamId = req.query.t
    next()
}