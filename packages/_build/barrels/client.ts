import _ from "lodash"
import { createExport } from "../util"

import basic_nodes_trigger_input_shared from "../../basic/nodes/trigger-input/shared"
import basic_nodes_trigger_input_client from "../../basic/nodes/trigger-input/client"
import basic_nodes_text_shared from "../../basic/nodes/text/shared"
import basic_nodes_text_client from "../../basic/nodes/text/client"
import basic_nodes_switch_shared from "../../basic/nodes/switch/shared"
import basic_nodes_switch_client from "../../basic/nodes/switch/client"
import basic_nodes_number_shared from "../../basic/nodes/number/shared"
import basic_nodes_number_client from "../../basic/nodes/number/client"
import basic_nodes_json_stringify_shared from "../../basic/nodes/json-stringify/shared"
import basic_nodes_json_stringify_client from "../../basic/nodes/json-stringify/client"
import basic_nodes_json_parse_shared from "../../basic/nodes/json-parse/shared"
import basic_nodes_json_parse_client from "../../basic/nodes/json-parse/client"
import basic_nodes_decompose_object_shared from "../../basic/nodes/decompose-object/shared"
import basic_nodes_decompose_object_client from "../../basic/nodes/decompose-object/client"
import basic_nodes_compose_object_shared from "../../basic/nodes/compose-object/shared"
import basic_nodes_compose_object_client from "../../basic/nodes/compose-object/client"
import basic_nodes_and_shared from "../../basic/nodes/and/shared"
import basic_nodes_and_client from "../../basic/nodes/and/client"
import basic_triggers_schedule_shared from "../../basic/triggers/schedule/shared"
import basic_triggers_schedule_client from "../../basic/triggers/schedule/client"
import basic_triggers_request_shared from "../../basic/triggers/request/shared"
import basic_triggers_request_client from "../../basic/triggers/request/client"
import basic_triggers_manual_shared from "../../basic/triggers/manual/shared"
import basic_triggers_manual_client from "../../basic/triggers/manual/client"
import openai_services_openai_shared from "../../openai/services/openai/shared"
import openai_services_openai_client from "../../openai/services/openai/client"
import google_services_google_oauth_shared from "../../google/services/google-oauth/shared"
import google_services_google_oauth_client from "../../google/services/google-oauth/client"
import basic_data_types_string_shared from "../../basic/data-types/string/shared"
import basic_data_types_string_client from "../../basic/data-types/string/client"
import basic_data_types_object_shared from "../../basic/data-types/object/shared"
import basic_data_types_object_client from "../../basic/data-types/object/client"
import basic_data_types_number_shared from "../../basic/data-types/number/shared"
import basic_data_types_number_client from "../../basic/data-types/number/client"
import basic_data_types_boolean_shared from "../../basic/data-types/boolean/shared"
import basic_data_types_boolean_client from "../../basic/data-types/boolean/client"
import basic_data_types_any_shared from "../../basic/data-types/any/shared"
import basic_data_types_any_client from "../../basic/data-types/any/client"
import type { SharedNodeDefinition, WebNodeDefinition, SharedTriggerDefinition, WebTriggerDefinition, SharedServiceDefinition, WebServiceDefinition, SharedDataTypeDefinition, WebDataTypeDefinition } from "@types"

export const NodeDefinitions = createExport({
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({},
        basic_nodes_trigger_input_shared,
        basic_nodes_trigger_input_client,
        { id: "https://nodes.workflow.dog/basic/trigger-input" }    
    ),
    "https://nodes.workflow.dog/basic/text": _.merge({},
        basic_nodes_text_shared,
        basic_nodes_text_client,
        { id: "https://nodes.workflow.dog/basic/text" }    
    ),
    "https://nodes.workflow.dog/basic/switch": _.merge({},
        basic_nodes_switch_shared,
        basic_nodes_switch_client,
        { id: "https://nodes.workflow.dog/basic/switch" }    
    ),
    "https://nodes.workflow.dog/basic/number": _.merge({},
        basic_nodes_number_shared,
        basic_nodes_number_client,
        { id: "https://nodes.workflow.dog/basic/number" }    
    ),
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({},
        basic_nodes_json_stringify_shared,
        basic_nodes_json_stringify_client,
        { id: "https://nodes.workflow.dog/basic/json-stringify" }    
    ),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({},
        basic_nodes_json_parse_shared,
        basic_nodes_json_parse_client,
        { id: "https://nodes.workflow.dog/basic/json-parse" }    
    ),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({},
        basic_nodes_decompose_object_shared,
        basic_nodes_decompose_object_client,
        { id: "https://nodes.workflow.dog/basic/decompose-object" }    
    ),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({},
        basic_nodes_compose_object_shared,
        basic_nodes_compose_object_client,
        { id: "https://nodes.workflow.dog/basic/compose-object" }    
    ),
    "https://nodes.workflow.dog/basic/and": _.merge({},
        basic_nodes_and_shared,
        basic_nodes_and_client,
        { id: "https://nodes.workflow.dog/basic/and" }    
    ),
} as Record<string, SharedNodeDefinition & WebNodeDefinition<any> & { id: string }>)

export const TriggerDefinitions = createExport({
    "https://triggers.workflow.dog/basic/schedule": _.merge({},
        basic_triggers_schedule_shared,
        basic_triggers_schedule_client,
        { id: "https://triggers.workflow.dog/basic/schedule" }    
    ),
    "https://triggers.workflow.dog/basic/request": _.merge({},
        basic_triggers_request_shared,
        basic_triggers_request_client,
        { id: "https://triggers.workflow.dog/basic/request" }    
    ),
    "https://triggers.workflow.dog/basic/manual": _.merge({},
        basic_triggers_manual_shared,
        basic_triggers_manual_client,
        { id: "https://triggers.workflow.dog/basic/manual" }    
    ),
} as Record<string, SharedTriggerDefinition & WebTriggerDefinition<any> & { id: string }>)

export const ServiceDefinitions = createExport({
    "https://services.workflow.dog/openai/openai": _.merge({},
        openai_services_openai_shared,
        openai_services_openai_client,
        { id: "https://services.workflow.dog/openai/openai" }    
    ),
    "https://services.workflow.dog/google/google-oauth": _.merge({},
        google_services_google_oauth_shared,
        google_services_google_oauth_client,
        { id: "https://services.workflow.dog/google/google-oauth" }    
    ),
} as Record<string, SharedServiceDefinition & WebServiceDefinition<any> & { id: string }>)

export const DataTypeDefinitions = createExport({
    "https://data-types.workflow.dog/basic/string": _.merge({},
        basic_data_types_string_shared,
        basic_data_types_string_client,
        { id: "https://data-types.workflow.dog/basic/string" }    
    ),
    "https://data-types.workflow.dog/basic/object": _.merge({},
        basic_data_types_object_shared,
        basic_data_types_object_client,
        { id: "https://data-types.workflow.dog/basic/object" }    
    ),
    "https://data-types.workflow.dog/basic/number": _.merge({},
        basic_data_types_number_shared,
        basic_data_types_number_client,
        { id: "https://data-types.workflow.dog/basic/number" }    
    ),
    "https://data-types.workflow.dog/basic/boolean": _.merge({},
        basic_data_types_boolean_shared,
        basic_data_types_boolean_client,
        { id: "https://data-types.workflow.dog/basic/boolean" }    
    ),
    "https://data-types.workflow.dog/basic/any": _.merge({},
        basic_data_types_any_shared,
        basic_data_types_any_client,
        { id: "https://data-types.workflow.dog/basic/any" }    
    ),
} as Record<string, SharedDataTypeDefinition & WebDataTypeDefinition<any> & { id: string }>)