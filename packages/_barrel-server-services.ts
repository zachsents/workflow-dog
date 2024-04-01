import _ from "lodash"

import sharedServicesOpenaiOpenai from "./openai/services/openai/shared"
import serverServicesOpenaiOpenai from "./openai/services/openai/server"
import sharedServicesGoogleGoogleOauth from "./google/services/google-oauth/shared"
import serverServicesGoogleGoogleOauth from "./google/services/google-oauth/server"

export const serverServices = {
    "https://services.workflow.dog/openai/openai": _.merge({}, sharedServicesOpenaiOpenai, serverServicesOpenaiOpenai, { id: "https://services.workflow.dog/openai/openai" }),
    "https://services.workflow.dog/google/google-oauth": _.merge({}, sharedServicesGoogleGoogleOauth, serverServicesGoogleGoogleOauth, { id: "https://services.workflow.dog/google/google-oauth" }),
}