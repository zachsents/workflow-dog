import _ from "lodash"
import { createExport } from "../util"

import openai_nodes_prompt_chatgpt_shared from "../../openai/nodes/prompt-chatgpt/shared"
import openai_nodes_prompt_chatgpt_client from "../../openai/nodes/prompt-chatgpt/client"
import math_nodes_tan_shared from "../../math/nodes/tan/shared"
import math_nodes_tan_client from "../../math/nodes/tan/client"
import math_nodes_sum_shared from "../../math/nodes/sum/shared"
import math_nodes_sum_client from "../../math/nodes/sum/client"
import math_nodes_subtract_shared from "../../math/nodes/subtract/shared"
import math_nodes_subtract_client from "../../math/nodes/subtract/client"
import math_nodes_square_root_shared from "../../math/nodes/square-root/shared"
import math_nodes_square_root_client from "../../math/nodes/square-root/client"
import math_nodes_sin_shared from "../../math/nodes/sin/shared"
import math_nodes_sin_client from "../../math/nodes/sin/client"
import math_nodes_round_shared from "../../math/nodes/round/shared"
import math_nodes_round_client from "../../math/nodes/round/client"
import math_nodes_pi_shared from "../../math/nodes/pi/shared"
import math_nodes_pi_client from "../../math/nodes/pi/client"
import math_nodes_natural_log_shared from "../../math/nodes/natural-log/shared"
import math_nodes_natural_log_client from "../../math/nodes/natural-log/client"
import math_nodes_multiply_shared from "../../math/nodes/multiply/shared"
import math_nodes_multiply_client from "../../math/nodes/multiply/client"
import math_nodes_min_shared from "../../math/nodes/min/shared"
import math_nodes_min_client from "../../math/nodes/min/client"
import math_nodes_max_shared from "../../math/nodes/max/shared"
import math_nodes_max_client from "../../math/nodes/max/client"
import math_nodes_log_shared from "../../math/nodes/log/shared"
import math_nodes_log_client from "../../math/nodes/log/client"
import math_nodes_less_than_shared from "../../math/nodes/less-than/shared"
import math_nodes_less_than_client from "../../math/nodes/less-than/client"
import math_nodes_greater_than_shared from "../../math/nodes/greater-than/shared"
import math_nodes_greater_than_client from "../../math/nodes/greater-than/client"
import math_nodes_floor_shared from "../../math/nodes/floor/shared"
import math_nodes_floor_client from "../../math/nodes/floor/client"
import math_nodes_exponent_shared from "../../math/nodes/exponent/shared"
import math_nodes_exponent_client from "../../math/nodes/exponent/client"
import math_nodes_e_shared from "../../math/nodes/e/shared"
import math_nodes_e_client from "../../math/nodes/e/client"
import math_nodes_divide_shared from "../../math/nodes/divide/shared"
import math_nodes_divide_client from "../../math/nodes/divide/client"
import math_nodes_cos_shared from "../../math/nodes/cos/shared"
import math_nodes_cos_client from "../../math/nodes/cos/client"
import math_nodes_ceiling_shared from "../../math/nodes/ceiling/shared"
import math_nodes_ceiling_client from "../../math/nodes/ceiling/client"
import math_nodes_add_shared from "../../math/nodes/add/shared"
import math_nodes_add_client from "../../math/nodes/add/client"
import math_nodes_absolute_shared from "../../math/nodes/absolute/shared"
import math_nodes_absolute_client from "../../math/nodes/absolute/client"
import closecrm_nodes_list_leads_shared from "../../closecrm/nodes/list-leads/shared"
import closecrm_nodes_list_leads_client from "../../closecrm/nodes/list-leads/client"
import closecrm_nodes_get_lead_by_id_shared from "../../closecrm/nodes/get-lead-by-id/shared"
import closecrm_nodes_get_lead_by_id_client from "../../closecrm/nodes/get-lead-by-id/client"
import basic_nodes_xor_shared from "../../basic/nodes/xor/shared"
import basic_nodes_xor_client from "../../basic/nodes/xor/client"
import basic_nodes_trigger_input_shared from "../../basic/nodes/trigger-input/shared"
import basic_nodes_trigger_input_client from "../../basic/nodes/trigger-input/client"
import basic_nodes_text_shared from "../../basic/nodes/text/shared"
import basic_nodes_text_client from "../../basic/nodes/text/client"
import basic_nodes_switch_shared from "../../basic/nodes/switch/shared"
import basic_nodes_switch_client from "../../basic/nodes/switch/client"
import basic_nodes_or_shared from "../../basic/nodes/or/shared"
import basic_nodes_or_client from "../../basic/nodes/or/client"
import basic_nodes_number_shared from "../../basic/nodes/number/shared"
import basic_nodes_number_client from "../../basic/nodes/number/client"
import basic_nodes_not_equal_shared from "../../basic/nodes/not-equal/shared"
import basic_nodes_not_equal_client from "../../basic/nodes/not-equal/client"
import basic_nodes_not_shared from "../../basic/nodes/not/shared"
import basic_nodes_not_client from "../../basic/nodes/not/client"
import basic_nodes_json_stringify_shared from "../../basic/nodes/json-stringify/shared"
import basic_nodes_json_stringify_client from "../../basic/nodes/json-stringify/client"
import basic_nodes_json_parse_shared from "../../basic/nodes/json-parse/shared"
import basic_nodes_json_parse_client from "../../basic/nodes/json-parse/client"
import basic_nodes_get_element_shared from "../../basic/nodes/get-element/shared"
import basic_nodes_get_element_client from "../../basic/nodes/get-element/client"
import basic_nodes_equal_shared from "../../basic/nodes/equal/shared"
import basic_nodes_equal_client from "../../basic/nodes/equal/client"
import basic_nodes_decompose_object_shared from "../../basic/nodes/decompose-object/shared"
import basic_nodes_decompose_object_client from "../../basic/nodes/decompose-object/client"
import basic_nodes_compose_object_shared from "../../basic/nodes/compose-object/shared"
import basic_nodes_compose_object_client from "../../basic/nodes/compose-object/client"
import basic_nodes_compose_list_shared from "../../basic/nodes/compose-list/shared"
import basic_nodes_compose_list_client from "../../basic/nodes/compose-list/client"
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
import closecrm_services_close_shared from "../../closecrm/services/close/shared"
import closecrm_services_close_client from "../../closecrm/services/close/client"
import closecrm_data_types_lead_shared from "../../closecrm/data-types/lead/shared"
import closecrm_data_types_lead_client from "../../closecrm/data-types/lead/client"
import basic_data_types_string_shared from "../../basic/data-types/string/shared"
import basic_data_types_string_client from "../../basic/data-types/string/client"
import basic_data_types_object_shared from "../../basic/data-types/object/shared"
import basic_data_types_object_client from "../../basic/data-types/object/client"
import basic_data_types_number_shared from "../../basic/data-types/number/shared"
import basic_data_types_number_client from "../../basic/data-types/number/client"
import basic_data_types_boolean_shared from "../../basic/data-types/boolean/shared"
import basic_data_types_boolean_client from "../../basic/data-types/boolean/client"
import basic_data_types_array_shared from "../../basic/data-types/array/shared"
import basic_data_types_array_client from "../../basic/data-types/array/client"
import basic_data_types_any_shared from "../../basic/data-types/any/shared"
import basic_data_types_any_client from "../../basic/data-types/any/client"
import type { SharedNodeDefinition, WebNodeDefinition, SharedTriggerDefinition, WebTriggerDefinition, SharedServiceDefinition, WebServiceDefinition, SharedDataTypeDefinition, WebDataTypeDefinition } from "@types"

export const NodeDefinitions = createExport({
    "https://nodes.workflow.dog/openai/prompt-chatgpt": _.merge({},
        openai_nodes_prompt_chatgpt_shared,
        openai_nodes_prompt_chatgpt_client,
        { id: "https://nodes.workflow.dog/openai/prompt-chatgpt" }    
    ),
    "https://nodes.workflow.dog/math/tan": _.merge({},
        math_nodes_tan_shared,
        math_nodes_tan_client,
        { id: "https://nodes.workflow.dog/math/tan" }    
    ),
    "https://nodes.workflow.dog/math/sum": _.merge({},
        math_nodes_sum_shared,
        math_nodes_sum_client,
        { id: "https://nodes.workflow.dog/math/sum" }    
    ),
    "https://nodes.workflow.dog/math/subtract": _.merge({},
        math_nodes_subtract_shared,
        math_nodes_subtract_client,
        { id: "https://nodes.workflow.dog/math/subtract" }    
    ),
    "https://nodes.workflow.dog/math/square-root": _.merge({},
        math_nodes_square_root_shared,
        math_nodes_square_root_client,
        { id: "https://nodes.workflow.dog/math/square-root" }    
    ),
    "https://nodes.workflow.dog/math/sin": _.merge({},
        math_nodes_sin_shared,
        math_nodes_sin_client,
        { id: "https://nodes.workflow.dog/math/sin" }    
    ),
    "https://nodes.workflow.dog/math/round": _.merge({},
        math_nodes_round_shared,
        math_nodes_round_client,
        { id: "https://nodes.workflow.dog/math/round" }    
    ),
    "https://nodes.workflow.dog/math/pi": _.merge({},
        math_nodes_pi_shared,
        math_nodes_pi_client,
        { id: "https://nodes.workflow.dog/math/pi" }    
    ),
    "https://nodes.workflow.dog/math/natural-log": _.merge({},
        math_nodes_natural_log_shared,
        math_nodes_natural_log_client,
        { id: "https://nodes.workflow.dog/math/natural-log" }    
    ),
    "https://nodes.workflow.dog/math/multiply": _.merge({},
        math_nodes_multiply_shared,
        math_nodes_multiply_client,
        { id: "https://nodes.workflow.dog/math/multiply" }    
    ),
    "https://nodes.workflow.dog/math/min": _.merge({},
        math_nodes_min_shared,
        math_nodes_min_client,
        { id: "https://nodes.workflow.dog/math/min" }    
    ),
    "https://nodes.workflow.dog/math/max": _.merge({},
        math_nodes_max_shared,
        math_nodes_max_client,
        { id: "https://nodes.workflow.dog/math/max" }    
    ),
    "https://nodes.workflow.dog/math/log": _.merge({},
        math_nodes_log_shared,
        math_nodes_log_client,
        { id: "https://nodes.workflow.dog/math/log" }    
    ),
    "https://nodes.workflow.dog/math/less-than": _.merge({},
        math_nodes_less_than_shared,
        math_nodes_less_than_client,
        { id: "https://nodes.workflow.dog/math/less-than" }    
    ),
    "https://nodes.workflow.dog/math/greater-than": _.merge({},
        math_nodes_greater_than_shared,
        math_nodes_greater_than_client,
        { id: "https://nodes.workflow.dog/math/greater-than" }    
    ),
    "https://nodes.workflow.dog/math/floor": _.merge({},
        math_nodes_floor_shared,
        math_nodes_floor_client,
        { id: "https://nodes.workflow.dog/math/floor" }    
    ),
    "https://nodes.workflow.dog/math/exponent": _.merge({},
        math_nodes_exponent_shared,
        math_nodes_exponent_client,
        { id: "https://nodes.workflow.dog/math/exponent" }    
    ),
    "https://nodes.workflow.dog/math/e": _.merge({},
        math_nodes_e_shared,
        math_nodes_e_client,
        { id: "https://nodes.workflow.dog/math/e" }    
    ),
    "https://nodes.workflow.dog/math/divide": _.merge({},
        math_nodes_divide_shared,
        math_nodes_divide_client,
        { id: "https://nodes.workflow.dog/math/divide" }    
    ),
    "https://nodes.workflow.dog/math/cos": _.merge({},
        math_nodes_cos_shared,
        math_nodes_cos_client,
        { id: "https://nodes.workflow.dog/math/cos" }    
    ),
    "https://nodes.workflow.dog/math/ceiling": _.merge({},
        math_nodes_ceiling_shared,
        math_nodes_ceiling_client,
        { id: "https://nodes.workflow.dog/math/ceiling" }    
    ),
    "https://nodes.workflow.dog/math/add": _.merge({},
        math_nodes_add_shared,
        math_nodes_add_client,
        { id: "https://nodes.workflow.dog/math/add" }    
    ),
    "https://nodes.workflow.dog/math/absolute": _.merge({},
        math_nodes_absolute_shared,
        math_nodes_absolute_client,
        { id: "https://nodes.workflow.dog/math/absolute" }    
    ),
    "https://nodes.workflow.dog/closecrm/list-leads": _.merge({},
        closecrm_nodes_list_leads_shared,
        closecrm_nodes_list_leads_client,
        { id: "https://nodes.workflow.dog/closecrm/list-leads" }    
    ),
    "https://nodes.workflow.dog/closecrm/get-lead-by-id": _.merge({},
        closecrm_nodes_get_lead_by_id_shared,
        closecrm_nodes_get_lead_by_id_client,
        { id: "https://nodes.workflow.dog/closecrm/get-lead-by-id" }    
    ),
    "https://nodes.workflow.dog/basic/xor": _.merge({},
        basic_nodes_xor_shared,
        basic_nodes_xor_client,
        { id: "https://nodes.workflow.dog/basic/xor" }    
    ),
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
    "https://nodes.workflow.dog/basic/or": _.merge({},
        basic_nodes_or_shared,
        basic_nodes_or_client,
        { id: "https://nodes.workflow.dog/basic/or" }    
    ),
    "https://nodes.workflow.dog/basic/number": _.merge({},
        basic_nodes_number_shared,
        basic_nodes_number_client,
        { id: "https://nodes.workflow.dog/basic/number" }    
    ),
    "https://nodes.workflow.dog/basic/not-equal": _.merge({},
        basic_nodes_not_equal_shared,
        basic_nodes_not_equal_client,
        { id: "https://nodes.workflow.dog/basic/not-equal" }    
    ),
    "https://nodes.workflow.dog/basic/not": _.merge({},
        basic_nodes_not_shared,
        basic_nodes_not_client,
        { id: "https://nodes.workflow.dog/basic/not" }    
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
    "https://nodes.workflow.dog/basic/get-element": _.merge({},
        basic_nodes_get_element_shared,
        basic_nodes_get_element_client,
        { id: "https://nodes.workflow.dog/basic/get-element" }    
    ),
    "https://nodes.workflow.dog/basic/equal": _.merge({},
        basic_nodes_equal_shared,
        basic_nodes_equal_client,
        { id: "https://nodes.workflow.dog/basic/equal" }    
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
    "https://nodes.workflow.dog/basic/compose-list": _.merge({},
        basic_nodes_compose_list_shared,
        basic_nodes_compose_list_client,
        { id: "https://nodes.workflow.dog/basic/compose-list" }    
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
    "https://services.workflow.dog/closecrm/close": _.merge({},
        closecrm_services_close_shared,
        closecrm_services_close_client,
        { id: "https://services.workflow.dog/closecrm/close" }    
    ),
} as Record<string, SharedServiceDefinition & WebServiceDefinition<any> & { id: string }>)

export const DataTypeDefinitions = createExport({
    "https://data-types.workflow.dog/closecrm/lead": _.merge({},
        closecrm_data_types_lead_shared,
        closecrm_data_types_lead_client,
        { id: "https://data-types.workflow.dog/closecrm/lead" }    
    ),
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
    "https://data-types.workflow.dog/basic/array": _.merge({},
        basic_data_types_array_shared,
        basic_data_types_array_client,
        { id: "https://data-types.workflow.dog/basic/array" }    
    ),
    "https://data-types.workflow.dog/basic/any": _.merge({},
        basic_data_types_any_shared,
        basic_data_types_any_client,
        { id: "https://data-types.workflow.dog/basic/any" }    
    ),
} as Record<string, SharedDataTypeDefinition & WebDataTypeDefinition<any> & { id: string }>)