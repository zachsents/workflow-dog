import { createExpressMiddleware } from "@trpc/server/adapters/express"
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
import { useEnvVar } from "./lib/utils"
import { createContext } from "./trpc"
import { apiRouter } from "./trpc/router"


const port = process.env.PORT || 3001
const app = express()

initSupertokens()

app.use(cors({
    origin: useEnvVar("APP_ORIGIN"),
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
}))

app.use((req, res, next) => {
    // prevent morgan from logging health checks
    if (req.path !== "/api/health")
        return morgan("dev")(req, res, next)
    next()
})

app.use(supertokensMiddleware())    // supertokens middleware -- must be after cors
app.use(cookieParser())


app.use("/api/trpc", createExpressMiddleware({
    router: apiRouter,
    createContext,
}))

app.get("/api/health", (_, res) => void res.send("ok"))

if (process.env.DEV) {
    app.use("/api/panel", async (_, res) => {
        const { renderTrpcPanel } = await import("trpc-panel")
        return res.send(
            renderTrpcPanel(apiRouter, { url: `http://localhost:${port}/api/trpc` })
        )
    })
}

// Error handlers come after routes
app.use(supertokensErrorHandler())

app.listen(port, () => {
    console.log(`WFD API is running on port ${port}`)
    if (process.env.DEV)
        console.log(`-- DEV MODE --\n${useEnvVar("APP_ORIGIN")}/api/panel`)
})
