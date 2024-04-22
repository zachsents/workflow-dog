import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedClientServiceDefinition } from "@pkg/types"
import google_services_google_oauth_client from "../../google/services/google-oauth/client"
import closecrm_services_close_client from "../../closecrm/services/close/client"
import openai_services_openai_client from "../../openai/services/openai/client"


const _definitions = {
    // EXPORTS
    "https://services.workflow.dog/google/google-oauth": _.merge({ id: "https://services.workflow.dog/google/google-oauth" }, google_services_google_oauth_client),
    "https://services.workflow.dog/closecrm/close": _.merge({ id: "https://services.workflow.dog/closecrm/close" }, closecrm_services_close_client),
    "https://services.workflow.dog/openai/openai": _.merge({ id: "https://services.workflow.dog/openai/openai" }, openai_services_openai_client),
}

export const Definitions = createExport<MergedClientServiceDefinition, typeof _definitions>(_definitions)
