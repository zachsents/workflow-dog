import _ from "lodash"
import { createExport } from "../util"


import basic_triggers_schedule_shared from "../../basic/triggers/schedule/shared"
import basic_triggers_schedule_server from "../../basic/triggers/schedule/server"
import basic_triggers_request_shared from "../../basic/triggers/request/shared"
import basic_triggers_request_server from "../../basic/triggers/request/server"
import basic_triggers_manual_shared from "../../basic/triggers/manual/shared"
import basic_triggers_manual_server from "../../basic/triggers/manual/server"
import openai_services_openai_shared from "../../openai/services/openai/shared"
import openai_services_openai_server from "../../openai/services/openai/server"
import google_services_google_oauth_shared from "../../google/services/google-oauth/shared"
import google_services_google_oauth_server from "../../google/services/google-oauth/server"

import type { SharedTriggerDefinition, ServerTriggerDefinition, SharedServiceDefinition, ServerServiceDefinition } from "@types"

export const NodeDefinitions = createExport({

} as Record<string, any & { id: string }>)

export const TriggerDefinitions = createExport({
    "https://triggers.workflow.dog/basic/schedule": _.merge({},
        basic_triggers_schedule_shared,
        basic_triggers_schedule_server,
        { id: "https://triggers.workflow.dog/basic/schedule" }    
    ),
    "https://triggers.workflow.dog/basic/request": _.merge({},
        basic_triggers_request_shared,
        basic_triggers_request_server,
        { id: "https://triggers.workflow.dog/basic/request" }    
    ),
    "https://triggers.workflow.dog/basic/manual": _.merge({},
        basic_triggers_manual_shared,
        basic_triggers_manual_server,
        { id: "https://triggers.workflow.dog/basic/manual" }    
    ),
} as Record<string, SharedTriggerDefinition & ServerTriggerDefinition<any> & { id: string }>)

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
} as Record<string, SharedServiceDefinition & ServerServiceDefinition<any> & { id: string }>)

export const DataTypeDefinitions = createExport({

} as Record<string, any & { id: string }>)