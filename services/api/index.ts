import { createExpressMiddleware } from "@trpc/server/adapters/express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import morgan from "morgan"
import supertokens from "supertokens-node"
import {
    errorHandler as supertokensErrorHandler,
    middleware as supertokensMiddleware,
    type SessionRequest
} from "supertokens-node/framework/express"
import { initSupertokens } from "./lib/auth"
import "./lib/bullmq"
import { db } from "./lib/db"
import { handleEventSourceRequest } from "./lib/internal/event-sources"
import { getWorkflowRunStatus } from "./lib/internal/workflow-runs"
import { handleWebhookRequest as handleStripeWebhookRequest, stripe } from "./lib/stripe"
import { useEnvVar } from "./lib/utils"
import { createContext } from "./trpc"
import { apiRouter } from "./trpc/router"
import { verifySession } from "supertokens-node/recipe/session/framework/express"
import { sql } from "kysely"


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

// Stripe webhooks
app.post("/api/stripe/webhook", bodyParser.text({ type: "*/*" }), handleStripeWebhookRequest)

// Stripe customer portal
app.post("/projects/:projectId/billing/portal", verifySession({
    checkDatabase: true,
    antiCsrfCheck: true,
    sessionRequired: true,
}), async (req, res) => {
    const projectId = req.params.projectId

    const { has_permission } = await db.selectNoFrom(eb => eb.exists(
        eb.selectFrom("projects_users")
            .where("project_id", "=", projectId)
            .where("user_id", "=", (req as SessionRequest).session!.getUserId())
            .where(sql<boolean>`'write'::project_permission = any(permissions)`)
    ).as("has_permission")).executeTakeFirstOrThrow()

    if (!has_permission)
        return res.status(403).send("You don't have permission to do that.")

    const project = await db.selectFrom("projects")
        .select("stripe_customer_id")
        .where("id", "=", projectId)
        .executeTakeFirst()

    if (!project)
        return res.status(404).send("Project not found")
    if (!project.stripe_customer_id)
        return res.status(500).send("Project has no Stripe customer ID. This is a bug.")

    const session = await stripe.billingPortal.sessions.create({
        customer: project.stripe_customer_id,
        return_url: `${useEnvVar("APP_ORIGIN")}/projects/${projectId}/usage-billing`,
    })
    return res.status(303).redirect(session.url)
})

app.post("/projects/:projectId/billing/upgrade", verifySession({
    checkDatabase: true,
    antiCsrfCheck: true,
    sessionRequired: true,
}), async (req, res) => {
    const projectId = req.params.projectId

    const { has_permission } = await db.selectNoFrom(eb => eb.exists(
        eb.selectFrom("projects_users")
            .where("project_id", "=", projectId)
            .where("user_id", "=", (req as SessionRequest).session!.getUserId())
            .where(sql<boolean>`'write'::project_permission = any(permissions)`)
    ).as("has_permission")).executeTakeFirstOrThrow()

    if (!has_permission)
        return res.status(403).send("You don't have permission to do that.")

    const project = await db.selectFrom("projects")
        .select(["stripe_customer_id", "stripe_subscription_id"])
        .where("id", "=", projectId)
        .executeTakeFirst()

    if (!project)
        return res.status(404).send("Project not found")
    if (!project.stripe_customer_id)
        return res.status(500).send("Project has no Stripe customer ID. This is a bug.")
    if (!project.stripe_subscription_id)
        return res.status(500).send("Project has no Stripe subscription ID. This is a bug.")

    const session = await stripe.billingPortal.sessions.create({
        customer: project.stripe_customer_id,
        return_url: `${useEnvVar("APP_ORIGIN")}/projects/${projectId}/usage-billing`,
        flow_data: {
            type: "subscription_update",
            subscription_update: {
                subscription: project.stripe_subscription_id,
            },
        },
    })
    return res.status(303).redirect(session.url)
})


// Error handlers come after routes
app.use(supertokensErrorHandler())

app.listen(port, () => {
    console.log(`${useEnvVar("APP_NAME")} API is running on port ${port}`)
})
