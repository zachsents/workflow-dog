import _ from "lodash"
import { createExport } from "../util"


import basic_triggers_schedule_server from "../../basic/triggers/schedule/server"
import basic_triggers_request_server from "../../basic/triggers/request/server"
import basic_triggers_manual_server from "../../basic/triggers/manual/server"
import openai_services_openai_server from "../../openai/services/openai/server"
import google_services_google_oauth_server from "../../google/services/google-oauth/server"
import closecrm_services_close_server from "../../closecrm/services/close/server"


export const NodeDefinitions = createExport({

})

export const TriggerDefinitions = createExport({
    "https://triggers.workflow.dog/basic/schedule": _.merge(
        { id: "https://triggers.workflow.dog/basic/schedule" },    
        basic_triggers_schedule_server,
    ),
    "https://triggers.workflow.dog/basic/request": _.merge(
        { id: "https://triggers.workflow.dog/basic/request" },    
        basic_triggers_request_server,
    ),
    "https://triggers.workflow.dog/basic/manual": _.merge(
        { id: "https://triggers.workflow.dog/basic/manual" },    
        basic_triggers_manual_server,
    ),
})

export const ServiceDefinitions = createExport({
    "https://services.workflow.dog/openai/openai": _.merge(
        { id: "https://services.workflow.dog/openai/openai" },    
        openai_services_openai_server,
    ),
    "https://services.workflow.dog/google/google-oauth": _.merge(
        { id: "https://services.workflow.dog/google/google-oauth" },    
        google_services_google_oauth_server,
    ),
    "https://services.workflow.dog/closecrm/close": _.merge(
        { id: "https://services.workflow.dog/closecrm/close" },    
        closecrm_services_close_server,
    ),
})

export const DataTypeDefinitions = createExport({

})