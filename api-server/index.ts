console.time("Server startup")
import { createClient } from "@supabase/supabase-js"
import cookieSession from "cookie-session"
import cors from "cors"
import express, { Request, Response } from "express"
import morgan from "morgan"
import { ServiceDefinitions } from "packages/server.js"
import { addApiKeyAccount } from "./modules/api-keys.js"
import { getTokenForOAuth2Account, oauth2AuthorizationRedirect, oauth2Callback } from "./modules/oauth2.js"
import { assignNewTrigger, updateTriggerConfig } from "./modules/triggers.js"


const port = process.env.PORT ? parseInt(process.env.PORT) : 8080


/* -------------------------------------------------------------------------- */
/*                           App & Middleware Setup                           */
/* -------------------------------------------------------------------------- */
const app = express()
app.use(cors())
app.use((req, res, next) => {
    (req as any).rawBody = ''
    req.on("data", chunk => {
        (req as any).rawBody += chunk
    })
    next()
})
app.use(express.json())
app.use(morgan("dev"))


/* -------------------------------------------------------------------------- */
/*                                  Endpoints                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Service Routes ---------------------------- */

app.get("/services/:serviceName/connect", (req: Request, res: Response) => {
    const service = ServiceDefinitions.resolve(req.params.serviceName)

    if (!service)
        return res.status(404).send("Service not found")

    switch (service.authAcquisition.method) {
        case "oauth2":
            return res.redirect(`/oauth2/${req.params.serviceName}/connect`)
    }

    res.sendStatus(405)
})

app.post("/services/:serviceName/connect", (req: Request, res: Response) => {
    const service = ServiceDefinitions.resolve(req.params.serviceName)

    if (!service)
        return res.status(404).send("Service not found")

    switch (service.authAcquisition.method) {
        case "key":
            return addApiKeyAccount(req, res)
        case "user-pass":
            // TO DO: Implement user-pass auth
            return res.status(500).send("Not implemented")
    }

    res.sendStatus(405)
})


/* ----------------------------- Account Routes ----------------------------- */

app.get("/accounts/:accountId/token", async (req: Request, res: Response) => {

    const bearerKey = req.headers.authorization?.split("Bearer ")[1] || ""
    const requesterClient = createClient(process.env.SUPABASE_URL, bearerKey)

    const { data: account } = await requesterClient
        .from("integration_accounts")
        .select("*")
        .eq("id", req.params.accountId)
        .single()
        .throwOnError()

    if (!account)
        return res.status(404).send("Account not found")

    const service = ServiceDefinitions.get(account.service_id)

    if (!service)
        return res.status(404).send("Service not found")

    switch (service.authAcquisition.method) {
        case "oauth2":
            return getTokenForOAuth2Account(req, res, account, requesterClient)
        case "key":
            return res.send({ key: account.token.key })
        default:
            return res.send(account.token)
    }
})


/* --------------------------------- OAuth2 --------------------------------- */

app.use("/oauth2/*", cookieSession({
    signed: false,
    secure: false,
    maxAge: 5 * 60 * 1000,
}))
app.get("/oauth2/:serviceName/connect", oauth2AuthorizationRedirect)
app.get("/oauth2/:serviceName/connect/callback", oauth2Callback)


/* -------------------------------- Triggers -------------------------------- */

app.put("/workflows/:workflowId/trigger", assignNewTrigger)
app.patch("/workflows/:workflowId/trigger", updateTriggerConfig)


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("API server running on port", port, `(${process.env.NODE_ENV})`)
    console.timeEnd("Server startup")
})