import _ from "lodash"
import { createExport } from "../util"


import basic_triggers_schedule_shared from "../../basic/triggers/schedule/shared"
import basic_triggers_schedule_server from "../../basic/triggers/schedule/server"
import basic_triggers_manual_shared from "../../basic/triggers/manual/shared"
import basic_triggers_manual_server from "../../basic/triggers/manual/server"
import openai_services_openai_shared from "../../openai/services/openai/shared"
import openai_services_openai_server from "../../openai/services/openai/server"
import google_services_google_oauth_shared from "../../google/services/google-oauth/shared"
import google_services_google_oauth_server from "../../google/services/google-oauth/server"


export const NodeDefinitions = createExport({

})

export const TriggerDefinitions = createExport({
    "https://triggers.workflow.dog/basic/schedule": _.merge({},
        basic_triggers_schedule_shared,
        basic_triggers_schedule_server,
        { id: "https://triggers.workflow.dog/basic/schedule" }    
    ),
    "https://triggers.workflow.dog/basic/manual": _.merge({},
        basic_triggers_manual_shared,
        basic_triggers_manual_server,
        { id: "https://triggers.workflow.dog/basic/manual" }    
    ),
})

export const ServiceDefinitions = createExport({
    "https://services.workflow.dog/openai/openai": _.merge({},
        openai_services_openai_shared,
        openai_services_openai_server,
        { id: "https://services.workflow.dog/openai/openai" }    
    ),
    "https://services.workflow.dog/google/google-oauth": _.merge({},
        google_services_google_oauth_shared,
        google_services_google_oauth_server,
        { id: "https://services.workflow.dog/google/google-oauth" }    
    ),
})

export const DataTypeDefinitions = createExport({

})