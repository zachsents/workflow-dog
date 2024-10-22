import { createExpressMiddleware } from "@trpc/server/adapters/express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import morgan from "morgan"
import supertokens from "supertokens-node"
import {
    errorHandler as supertokensErrorHandler,
    middleware as supertokensMiddleware
} from "supertokens-node/framework/express"
import { initSupertokens } from "./lib/auth"
import "./lib/bullmq"
import { handleEventSourceRequest } from "./lib/internal/event-sources"
import { getWorkflowRunStatus } from "./lib/internal/workflow-runs"
import { handleWebhookRequest as handleStripeWebhookRequest } from "./lib/stripe"
import { useEnvVar } from "./lib/utils"
import { createContext } from "./trpc"
import { apiRouter } from "./trpc/router"
import { handleThirdPartyOAuth2Callback } from "./lib/internal/third-party"


const port = useEnvVar("PORT")
const app = express()

initSupertokens()

// Middleware - CORS
app.use(cors({
    origin: useEnvVar("APP_ORIGIN"),
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
}))

// Middleware - prevent morgan from logging health checks
app.use((req, res, next) => {
    if (req.path !== "/api/health")
        return morgan("dev")(req, res, next)
    next()
})

// Middleware - supertokens
// must be after cors
app.use(supertokensMiddleware())

// Middleware - cookie parser
app.use(cookieParser())

// TRPC router
app.use("/api/trpc", createExpressMiddleware({
    router: apiRouter,
    createContext,
}))

// Health check -- see Docker compose file
app.get("/api/health", (_, res) => void res.send("ok"))


// Run status endpoint
app.get("/api/workflow-runs/:workflowRunId/status", async (req, res) => {
    // TODO: add token to allow access

    try {
        const statusObj = await getWorkflowRunStatus(req.params.workflowRunId, {
            withOutputs: req.query.with_outputs != null,
        })
        return res.json(statusObj)
    } catch (err) {
        if (err instanceof Error) {
            if (err.message.includes("not found"))
                return res.status(404).send("Workflow run not found")
        }
        throw err
    }
})

// Event source handler
app.all(
    ["/run/x/:eventSourceId", "/run/x/:eventSourceId/*"],
    bodyParser.raw({ type: "*/*" }),
    handleEventSourceRequest,
)

// Third party OAuth2 callback
app.get("/api/thirdparty/oauth2/callback", handleThirdPartyOAuth2Callback)

// Stripe webhooks
app.post("/api/stripe/webhook", bodyParser.text({ type: "*/*" }), handleStripeWebhookRequest)


// Error handlers come after routes
app.use(supertokensErrorHandler())

app.listen(port, () => {
    console.log(`${useEnvVar("APP_NAME")} API is running on port ${port}`)
})
