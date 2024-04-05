import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedServerServiceDefinition } from "@pkg/types"
import closecrm_services_close_server from "../../closecrm/services/close/server"
import google_services_google_oauth_server from "../../google/services/google-oauth/server"
import openai_services_openai_server from "../../openai/services/openai/server"


const _definitions = {
    // EXPORTS
    "https://services.workflow.dog/closecrm/close": _.merge({ id: "https://services.workflow.dog/closecrm/close" }, closecrm_services_close_server),
    "https://services.workflow.dog/google/google-oauth": _.merge({ id: "https://services.workflow.dog/google/google-oauth" }, google_services_google_oauth_server),
    "https://services.workflow.dog/openai/openai": _.merge({ id: "https://services.workflow.dog/openai/openai" }, openai_services_openai_server),
}

export const Definitions = createExport<MergedServerServiceDefinition, typeof _definitions>(_definitions)
