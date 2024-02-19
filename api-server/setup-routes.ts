
import type { Express } from "express"
import { post as apikeys_connect__serviceName_post } from "./routes/apikeys/connect/:serviceName.js"
import { post as workflows__workflowId_run_post } from "./routes/workflows/:workflowId/run.js"
import { all as workflows__workflowId_trigger_request_all } from "./routes/workflows/:workflowId/trigger/request.js"
import { get as oauth2_connect__serviceName_callback_get } from "./routes/oauth2/connect/:serviceName/callback.js"
import { get as oauth2_connect__serviceName_get } from "./routes/oauth2/connect/:serviceName/index.js"
import { get as accounts__accountId_token_get } from "./routes/accounts/:accountId/token.js"

export function setupRoutes(app: Express) {
    app.post("apikeys/connect/:serviceName", apikeys_connect__serviceName_post)
	app.post("workflows/:workflowId/run", workflows__workflowId_run_post)
	app.all("workflows/:workflowId/trigger/request", workflows__workflowId_trigger_request_all)
	app.get("oauth2/connect/:serviceName/callback", oauth2_connect__serviceName_callback_get)
	app.get("oauth2/connect/:serviceName", oauth2_connect__serviceName_get)
	app.get("accounts/:accountId/token", accounts__accountId_token_get)
}