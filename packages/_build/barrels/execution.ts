import _ from "lodash"
import { createExport } from "../util"

import openai_nodes_prompt_chatgpt_execution from "../../openai/nodes/prompt-chatgpt/execution"
import math_nodes_tan_execution from "../../math/nodes/tan/execution"
import math_nodes_sum_execution from "../../math/nodes/sum/execution"
import math_nodes_subtract_execution from "../../math/nodes/subtract/execution"
import math_nodes_square_root_execution from "../../math/nodes/square-root/execution"
import math_nodes_sin_execution from "../../math/nodes/sin/execution"
import math_nodes_round_execution from "../../math/nodes/round/execution"
import math_nodes_pi_execution from "../../math/nodes/pi/execution"
import math_nodes_natural_log_execution from "../../math/nodes/natural-log/execution"
import math_nodes_multiply_execution from "../../math/nodes/multiply/execution"
import math_nodes_min_execution from "../../math/nodes/min/execution"
import math_nodes_max_execution from "../../math/nodes/max/execution"
import math_nodes_log_execution from "../../math/nodes/log/execution"
import math_nodes_less_than_execution from "../../math/nodes/less-than/execution"
import math_nodes_greater_than_execution from "../../math/nodes/greater-than/execution"
import math_nodes_floor_execution from "../../math/nodes/floor/execution"
import math_nodes_e_execution from "../../math/nodes/e/execution"
import math_nodes_exponent_execution from "../../math/nodes/exponent/execution"
import math_nodes_divide_execution from "../../math/nodes/divide/execution"
import math_nodes_cos_execution from "../../math/nodes/cos/execution"
import math_nodes_ceiling_execution from "../../math/nodes/ceiling/execution"
import math_nodes_add_execution from "../../math/nodes/add/execution"
import math_nodes_absolute_execution from "../../math/nodes/absolute/execution"
import google_nodes_gmail_send_email_execution from "../../google/nodes/gmail-send-email/execution"
import closecrm_nodes_list_leads_execution from "../../closecrm/nodes/list-leads/execution"
import closecrm_nodes_get_lead_by_id_execution from "../../closecrm/nodes/get-lead-by-id/execution"
import basic_nodes_xor_execution from "../../basic/nodes/xor/execution"
import basic_nodes_trigger_input_execution from "../../basic/nodes/trigger-input/execution"
import basic_nodes_text_execution from "../../basic/nodes/text/execution"
import basic_nodes_template_execution from "../../basic/nodes/template/execution"
import basic_nodes_switch_execution from "../../basic/nodes/switch/execution"
import basic_nodes_or_execution from "../../basic/nodes/or/execution"
import basic_nodes_number_execution from "../../basic/nodes/number/execution"
import basic_nodes_not_equal_execution from "../../basic/nodes/not-equal/execution"
import basic_nodes_not_execution from "../../basic/nodes/not/execution"
import basic_nodes_json_stringify_execution from "../../basic/nodes/json-stringify/execution"
import basic_nodes_json_parse_execution from "../../basic/nodes/json-parse/execution"
import basic_nodes_get_element_execution from "../../basic/nodes/get-element/execution"
import basic_nodes_equal_execution from "../../basic/nodes/equal/execution"
import basic_nodes_decompose_object_execution from "../../basic/nodes/decompose-object/execution"
import basic_nodes_compose_object_execution from "../../basic/nodes/compose-object/execution"
import basic_nodes_compose_list_execution from "../../basic/nodes/compose-list/execution"
import basic_nodes_and_execution from "../../basic/nodes/and/execution"




export const NodeDefinitions = createExport({
    "https://nodes.workflow.dog/openai/prompt-chatgpt": _.merge(
        { id: "https://nodes.workflow.dog/openai/prompt-chatgpt" },    
        openai_nodes_prompt_chatgpt_execution,
    ),
    "https://nodes.workflow.dog/math/tan": _.merge(
        { id: "https://nodes.workflow.dog/math/tan" },    
        math_nodes_tan_execution,
    ),
    "https://nodes.workflow.dog/math/sum": _.merge(
        { id: "https://nodes.workflow.dog/math/sum" },    
        math_nodes_sum_execution,
    ),
    "https://nodes.workflow.dog/math/subtract": _.merge(
        { id: "https://nodes.workflow.dog/math/subtract" },    
        math_nodes_subtract_execution,
    ),
    "https://nodes.workflow.dog/math/square-root": _.merge(
        { id: "https://nodes.workflow.dog/math/square-root" },    
        math_nodes_square_root_execution,
    ),
    "https://nodes.workflow.dog/math/sin": _.merge(
        { id: "https://nodes.workflow.dog/math/sin" },    
        math_nodes_sin_execution,
    ),
    "https://nodes.workflow.dog/math/round": _.merge(
        { id: "https://nodes.workflow.dog/math/round" },    
        math_nodes_round_execution,
    ),
    "https://nodes.workflow.dog/math/pi": _.merge(
        { id: "https://nodes.workflow.dog/math/pi" },    
        math_nodes_pi_execution,
    ),
    "https://nodes.workflow.dog/math/natural-log": _.merge(
        { id: "https://nodes.workflow.dog/math/natural-log" },    
        math_nodes_natural_log_execution,
    ),
    "https://nodes.workflow.dog/math/multiply": _.merge(
        { id: "https://nodes.workflow.dog/math/multiply" },    
        math_nodes_multiply_execution,
    ),
    "https://nodes.workflow.dog/math/min": _.merge(
        { id: "https://nodes.workflow.dog/math/min" },    
        math_nodes_min_execution,
    ),
    "https://nodes.workflow.dog/math/max": _.merge(
        { id: "https://nodes.workflow.dog/math/max" },    
        math_nodes_max_execution,
    ),
    "https://nodes.workflow.dog/math/log": _.merge(
        { id: "https://nodes.workflow.dog/math/log" },    
        math_nodes_log_execution,
    ),
    "https://nodes.workflow.dog/math/less-than": _.merge(
        { id: "https://nodes.workflow.dog/math/less-than" },    
        math_nodes_less_than_execution,
    ),
    "https://nodes.workflow.dog/math/greater-than": _.merge(
        { id: "https://nodes.workflow.dog/math/greater-than" },    
        math_nodes_greater_than_execution,
    ),
    "https://nodes.workflow.dog/math/floor": _.merge(
        { id: "https://nodes.workflow.dog/math/floor" },    
        math_nodes_floor_execution,
    ),
    "https://nodes.workflow.dog/math/e": _.merge(
        { id: "https://nodes.workflow.dog/math/e" },    
        math_nodes_e_execution,
    ),
    "https://nodes.workflow.dog/math/exponent": _.merge(
        { id: "https://nodes.workflow.dog/math/exponent" },    
        math_nodes_exponent_execution,
    ),
    "https://nodes.workflow.dog/math/divide": _.merge(
        { id: "https://nodes.workflow.dog/math/divide" },    
        math_nodes_divide_execution,
    ),
    "https://nodes.workflow.dog/math/cos": _.merge(
        { id: "https://nodes.workflow.dog/math/cos" },    
        math_nodes_cos_execution,
    ),
    "https://nodes.workflow.dog/math/ceiling": _.merge(
        { id: "https://nodes.workflow.dog/math/ceiling" },    
        math_nodes_ceiling_execution,
    ),
    "https://nodes.workflow.dog/math/add": _.merge(
        { id: "https://nodes.workflow.dog/math/add" },    
        math_nodes_add_execution,
    ),
    "https://nodes.workflow.dog/math/absolute": _.merge(
        { id: "https://nodes.workflow.dog/math/absolute" },    
        math_nodes_absolute_execution,
    ),
    "https://nodes.workflow.dog/google/gmail-send-email": _.merge(
        { id: "https://nodes.workflow.dog/google/gmail-send-email" },    
        google_nodes_gmail_send_email_execution,
    ),
    "https://nodes.workflow.dog/closecrm/list-leads": _.merge(
        { id: "https://nodes.workflow.dog/closecrm/list-leads" },    
        closecrm_nodes_list_leads_execution,
    ),
    "https://nodes.workflow.dog/closecrm/get-lead-by-id": _.merge(
        { id: "https://nodes.workflow.dog/closecrm/get-lead-by-id" },    
        closecrm_nodes_get_lead_by_id_execution,
    ),
    "https://nodes.workflow.dog/basic/xor": _.merge(
        { id: "https://nodes.workflow.dog/basic/xor" },    
        basic_nodes_xor_execution,
    ),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge(
        { id: "https://nodes.workflow.dog/basic/trigger-input" },    
        basic_nodes_trigger_input_execution,
    ),
    "https://nodes.workflow.dog/basic/text": _.merge(
        { id: "https://nodes.workflow.dog/basic/text" },    
        basic_nodes_text_execution,
    ),
    "https://nodes.workflow.dog/basic/template": _.merge(
        { id: "https://nodes.workflow.dog/basic/template" },    
        basic_nodes_template_execution,
    ),
    "https://nodes.workflow.dog/basic/switch": _.merge(
        { id: "https://nodes.workflow.dog/basic/switch" },    
        basic_nodes_switch_execution,
    ),
    "https://nodes.workflow.dog/basic/or": _.merge(
        { id: "https://nodes.workflow.dog/basic/or" },    
        basic_nodes_or_execution,
    ),
    "https://nodes.workflow.dog/basic/number": _.merge(
        { id: "https://nodes.workflow.dog/basic/number" },    
        basic_nodes_number_execution,
    ),
    "https://nodes.workflow.dog/basic/not-equal": _.merge(
        { id: "https://nodes.workflow.dog/basic/not-equal" },    
        basic_nodes_not_equal_execution,
    ),
    "https://nodes.workflow.dog/basic/not": _.merge(
        { id: "https://nodes.workflow.dog/basic/not" },    
        basic_nodes_not_execution,
    ),
    "https://nodes.workflow.dog/basic/json-stringify": _.merge(
        { id: "https://nodes.workflow.dog/basic/json-stringify" },    
        basic_nodes_json_stringify_execution,
    ),
    "https://nodes.workflow.dog/basic/json-parse": _.merge(
        { id: "https://nodes.workflow.dog/basic/json-parse" },    
        basic_nodes_json_parse_execution,
    ),
    "https://nodes.workflow.dog/basic/get-element": _.merge(
        { id: "https://nodes.workflow.dog/basic/get-element" },    
        basic_nodes_get_element_execution,
    ),
    "https://nodes.workflow.dog/basic/equal": _.merge(
        { id: "https://nodes.workflow.dog/basic/equal" },    
        basic_nodes_equal_execution,
    ),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge(
        { id: "https://nodes.workflow.dog/basic/decompose-object" },    
        basic_nodes_decompose_object_execution,
    ),
    "https://nodes.workflow.dog/basic/compose-object": _.merge(
        { id: "https://nodes.workflow.dog/basic/compose-object" },    
        basic_nodes_compose_object_execution,
    ),
    "https://nodes.workflow.dog/basic/compose-list": _.merge(
        { id: "https://nodes.workflow.dog/basic/compose-list" },    
        basic_nodes_compose_list_execution,
    ),
    "https://nodes.workflow.dog/basic/and": _.merge(
        { id: "https://nodes.workflow.dog/basic/and" },    
        basic_nodes_and_execution,
    ),
})

export const TriggerDefinitions = createExport({

})

export const ServiceDefinitions = createExport({

})

export const DataTypeDefinitions = createExport({

})