
import type { Express } from "express"
import { post as _apikeys_connect__serviceName_post } from "./routes/apikeys/connect/:serviceName.js"
import { post as _workflows__workflowId_run_post } from "./routes/workflows/:workflowId/run.js"
import { all as _workflows__workflowId_trigger_request_all } from "./routes/workflows/:workflowId/trigger/request.js"
import { post as _workflows__workflowId_update_triggerConfig_post } from "./routes/workflows/:workflowId/update/triggerConfig.js"
import { get as _oauth2_connect__serviceName_callback_get } from "./routes/oauth2/connect/:serviceName/callback.js"
import { get as _oauth2_connect__serviceName_get } from "./routes/oauth2/connect/:serviceName/index.js"
import { get as _accounts__accountId_token_get } from "./routes/accounts/:accountId/token.js"

export function setupRoutes(app: Express) {
    app.post("/apikeys/connect/:serviceName", _apikeys_connect__serviceName_post)
	app.post("/workflows/:workflowId/run", _workflows__workflowId_run_post)
	app.all("/workflows/:workflowId/trigger/request", _workflows__workflowId_trigger_request_all)
	app.post("/workflows/:workflowId/update/triggerConfig", _workflows__workflowId_update_triggerConfig_post)
	app.get("/oauth2/connect/:serviceName/callback", _oauth2_connect__serviceName_callback_get)
	app.get("/oauth2/connect/:serviceName", _oauth2_connect__serviceName_get)
	app.get("/accounts/:accountId/token", _accounts__accountId_token_get)
}