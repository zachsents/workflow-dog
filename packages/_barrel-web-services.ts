import _ from "lodash"

import sharedServicesOpenaiOpenai from "./openai/services/openai/shared"
import webServicesOpenaiOpenai from "./openai/services/openai/web"
import sharedServicesGoogleGoogleOauth from "./google/services/google-oauth/shared"
import webServicesGoogleGoogleOauth from "./google/services/google-oauth/web"

export const webServices = {
    "https://services.workflow.dog/openai/openai": _.merge({}, sharedServicesOpenaiOpenai, webServicesOpenaiOpenai, { id: "https://services.workflow.dog/openai/openai" }),
    "https://services.workflow.dog/google/google-oauth": _.merge({}, sharedServicesGoogleGoogleOauth, webServicesGoogleGoogleOauth, { id: "https://services.workflow.dog/google/google-oauth" }),
}