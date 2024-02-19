console.time("Server startup")
import cookieSession from "cookie-session"
import cors from "cors"
import express from "express"
import morgan from "morgan"
import { setupRoutes } from "./setup-routes.js"


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

app.use("/oauth2/*", cookieSession({
    signed: false,
    secure: false,
    maxAge: 5 * 60 * 1000,
}))


setupRoutes(app)


/* -------------------------------------------------------------------------- */
/*                                 Publish App                                */
/* -------------------------------------------------------------------------- */

app.listen(port, () => {
    console.log("API server running on port", port, `(${process.env.NODE_ENV})`)
    console.timeEnd("Server startup")
})