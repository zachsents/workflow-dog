import _ from "lodash"
import { createExport } from "../util"

import openai_nodes_prompt_chatgpt_shared from "../../openai/nodes/prompt-chatgpt/shared"
import openai_nodes_prompt_chatgpt_execution from "../../openai/nodes/prompt-chatgpt/execution"
import math_nodes_tan_shared from "../../math/nodes/tan/shared"
import math_nodes_tan_execution from "../../math/nodes/tan/execution"
import math_nodes_sum_shared from "../../math/nodes/sum/shared"
import math_nodes_sum_execution from "../../math/nodes/sum/execution"
import math_nodes_subtract_shared from "../../math/nodes/subtract/shared"
import math_nodes_subtract_execution from "../../math/nodes/subtract/execution"
import math_nodes_square_root_shared from "../../math/nodes/square-root/shared"
import math_nodes_square_root_execution from "../../math/nodes/square-root/execution"
import math_nodes_sin_shared from "../../math/nodes/sin/shared"
import math_nodes_sin_execution from "../../math/nodes/sin/execution"
import math_nodes_round_shared from "../../math/nodes/round/shared"
import math_nodes_round_execution from "../../math/nodes/round/execution"
import math_nodes_pi_shared from "../../math/nodes/pi/shared"
import math_nodes_pi_execution from "../../math/nodes/pi/execution"
import math_nodes_natural_log_shared from "../../math/nodes/natural-log/shared"
import math_nodes_natural_log_execution from "../../math/nodes/natural-log/execution"
import math_nodes_multiply_shared from "../../math/nodes/multiply/shared"
import math_nodes_multiply_execution from "../../math/nodes/multiply/execution"
import math_nodes_min_shared from "../../math/nodes/min/shared"
import math_nodes_min_execution from "../../math/nodes/min/execution"
import math_nodes_max_shared from "../../math/nodes/max/shared"
import math_nodes_max_execution from "../../math/nodes/max/execution"
import math_nodes_log_shared from "../../math/nodes/log/shared"
import math_nodes_log_execution from "../../math/nodes/log/execution"
import math_nodes_less_than_shared from "../../math/nodes/less-than/shared"
import math_nodes_less_than_execution from "../../math/nodes/less-than/execution"
import math_nodes_greater_than_shared from "../../math/nodes/greater-than/shared"
import math_nodes_greater_than_execution from "../../math/nodes/greater-than/execution"
import math_nodes_floor_shared from "../../math/nodes/floor/shared"
import math_nodes_floor_execution from "../../math/nodes/floor/execution"
import math_nodes_exponent_shared from "../../math/nodes/exponent/shared"
import math_nodes_exponent_execution from "../../math/nodes/exponent/execution"
import math_nodes_e_shared from "../../math/nodes/e/shared"
import math_nodes_e_execution from "../../math/nodes/e/execution"
import math_nodes_divide_shared from "../../math/nodes/divide/shared"
import math_nodes_divide_execution from "../../math/nodes/divide/execution"
import math_nodes_cos_shared from "../../math/nodes/cos/shared"
import math_nodes_cos_execution from "../../math/nodes/cos/execution"
import math_nodes_ceiling_shared from "../../math/nodes/ceiling/shared"
import math_nodes_ceiling_execution from "../../math/nodes/ceiling/execution"
import math_nodes_add_shared from "../../math/nodes/add/shared"
import math_nodes_add_execution from "../../math/nodes/add/execution"
import math_nodes_absolute_shared from "../../math/nodes/absolute/shared"
import math_nodes_absolute_execution from "../../math/nodes/absolute/execution"
import closecrm_nodes_list_leads_shared from "../../closecrm/nodes/list-leads/shared"
import closecrm_nodes_list_leads_execution from "../../closecrm/nodes/list-leads/execution"
import closecrm_nodes_get_lead_by_id_shared from "../../closecrm/nodes/get-lead-by-id/shared"
import closecrm_nodes_get_lead_by_id_execution from "../../closecrm/nodes/get-lead-by-id/execution"
import basic_nodes_xor_shared from "../../basic/nodes/xor/shared"
import basic_nodes_xor_execution from "../../basic/nodes/xor/execution"
import basic_nodes_trigger_input_shared from "../../basic/nodes/trigger-input/shared"
import basic_nodes_trigger_input_execution from "../../basic/nodes/trigger-input/execution"
import basic_nodes_text_shared from "../../basic/nodes/text/shared"
import basic_nodes_text_execution from "../../basic/nodes/text/execution"
import basic_nodes_template_shared from "../../basic/nodes/template/shared"
import basic_nodes_template_execution from "../../basic/nodes/template/execution"
import basic_nodes_switch_shared from "../../basic/nodes/switch/shared"
import basic_nodes_switch_execution from "../../basic/nodes/switch/execution"
import basic_nodes_or_shared from "../../basic/nodes/or/shared"
import basic_nodes_or_execution from "../../basic/nodes/or/execution"
import basic_nodes_number_shared from "../../basic/nodes/number/shared"
import basic_nodes_number_execution from "../../basic/nodes/number/execution"
import basic_nodes_not_equal_shared from "../../basic/nodes/not-equal/shared"
import basic_nodes_not_equal_execution from "../../basic/nodes/not-equal/execution"
import basic_nodes_not_shared from "../../basic/nodes/not/shared"
import basic_nodes_not_execution from "../../basic/nodes/not/execution"
import basic_nodes_json_stringify_shared from "../../basic/nodes/json-stringify/shared"
import basic_nodes_json_stringify_execution from "../../basic/nodes/json-stringify/execution"
import basic_nodes_json_parse_shared from "../../basic/nodes/json-parse/shared"
import basic_nodes_json_parse_execution from "../../basic/nodes/json-parse/execution"
import basic_nodes_get_element_shared from "../../basic/nodes/get-element/shared"
import basic_nodes_get_element_execution from "../../basic/nodes/get-element/execution"
import basic_nodes_equal_shared from "../../basic/nodes/equal/shared"
import basic_nodes_equal_execution from "../../basic/nodes/equal/execution"
import basic_nodes_decompose_object_shared from "../../basic/nodes/decompose-object/shared"
import basic_nodes_decompose_object_execution from "../../basic/nodes/decompose-object/execution"
import basic_nodes_compose_object_shared from "../../basic/nodes/compose-object/shared"
import basic_nodes_compose_object_execution from "../../basic/nodes/compose-object/execution"
import basic_nodes_compose_list_shared from "../../basic/nodes/compose-list/shared"
import basic_nodes_compose_list_execution from "../../basic/nodes/compose-list/execution"
import basic_nodes_and_shared from "../../basic/nodes/and/shared"
import basic_nodes_and_execution from "../../basic/nodes/and/execution"



import type { SharedNodeDefinition, ExecutionNodeDefinition } from "@types"

export const NodeDefinitions = createExport({
    "https://nodes.workflow.dog/openai/prompt-chatgpt": _.merge({},
        openai_nodes_prompt_chatgpt_shared,
        openai_nodes_prompt_chatgpt_execution,
        { id: "https://nodes.workflow.dog/openai/prompt-chatgpt" }    
    ),
    "https://nodes.workflow.dog/math/tan": _.merge({},
        math_nodes_tan_shared,
        math_nodes_tan_execution,
        { id: "https://nodes.workflow.dog/math/tan" }    
    ),
    "https://nodes.workflow.dog/math/sum": _.merge({},
        math_nodes_sum_shared,
        math_nodes_sum_execution,
        { id: "https://nodes.workflow.dog/math/sum" }    
    ),
    "https://nodes.workflow.dog/math/subtract": _.merge({},
        math_nodes_subtract_shared,
        math_nodes_subtract_execution,
        { id: "https://nodes.workflow.dog/math/subtract" }    
    ),
    "https://nodes.workflow.dog/math/square-root": _.merge({},
        math_nodes_square_root_shared,
        math_nodes_square_root_execution,
        { id: "https://nodes.workflow.dog/math/square-root" }    
    ),
    "https://nodes.workflow.dog/math/sin": _.merge({},
        math_nodes_sin_shared,
        math_nodes_sin_execution,
        { id: "https://nodes.workflow.dog/math/sin" }    
    ),
    "https://nodes.workflow.dog/math/round": _.merge({},
        math_nodes_round_shared,
        math_nodes_round_execution,
        { id: "https://nodes.workflow.dog/math/round" }    
    ),
    "https://nodes.workflow.dog/math/pi": _.merge({},
        math_nodes_pi_shared,
        math_nodes_pi_execution,
        { id: "https://nodes.workflow.dog/math/pi" }    
    ),
    "https://nodes.workflow.dog/math/natural-log": _.merge({},
        math_nodes_natural_log_shared,
        math_nodes_natural_log_execution,
        { id: "https://nodes.workflow.dog/math/natural-log" }    
    ),
    "https://nodes.workflow.dog/math/multiply": _.merge({},
        math_nodes_multiply_shared,
        math_nodes_multiply_execution,
        { id: "https://nodes.workflow.dog/math/multiply" }    
    ),
    "https://nodes.workflow.dog/math/min": _.merge({},
        math_nodes_min_shared,
        math_nodes_min_execution,
        { id: "https://nodes.workflow.dog/math/min" }    
    ),
    "https://nodes.workflow.dog/math/max": _.merge({},
        math_nodes_max_shared,
        math_nodes_max_execution,
        { id: "https://nodes.workflow.dog/math/max" }    
    ),
    "https://nodes.workflow.dog/math/log": _.merge({},
        math_nodes_log_shared,
        math_nodes_log_execution,
        { id: "https://nodes.workflow.dog/math/log" }    
    ),
    "https://nodes.workflow.dog/math/less-than": _.merge({},
        math_nodes_less_than_shared,
        math_nodes_less_than_execution,
        { id: "https://nodes.workflow.dog/math/less-than" }    
    ),
    "https://nodes.workflow.dog/math/greater-than": _.merge({},
        math_nodes_greater_than_shared,
        math_nodes_greater_than_execution,
        { id: "https://nodes.workflow.dog/math/greater-than" }    
    ),
    "https://nodes.workflow.dog/math/floor": _.merge({},
        math_nodes_floor_shared,
        math_nodes_floor_execution,
        { id: "https://nodes.workflow.dog/math/floor" }    
    ),
    "https://nodes.workflow.dog/math/exponent": _.merge({},
        math_nodes_exponent_shared,
        math_nodes_exponent_execution,
        { id: "https://nodes.workflow.dog/math/exponent" }    
    ),
    "https://nodes.workflow.dog/math/e": _.merge({},
        math_nodes_e_shared,
        math_nodes_e_execution,
        { id: "https://nodes.workflow.dog/math/e" }    
    ),
    "https://nodes.workflow.dog/math/divide": _.merge({},
        math_nodes_divide_shared,
        math_nodes_divide_execution,
        { id: "https://nodes.workflow.dog/math/divide" }    
    ),
    "https://nodes.workflow.dog/math/cos": _.merge({},
        math_nodes_cos_shared,
        math_nodes_cos_execution,
        { id: "https://nodes.workflow.dog/math/cos" }    
    ),
    "https://nodes.workflow.dog/math/ceiling": _.merge({},
        math_nodes_ceiling_shared,
        math_nodes_ceiling_execution,
        { id: "https://nodes.workflow.dog/math/ceiling" }    
    ),
    "https://nodes.workflow.dog/math/add": _.merge({},
        math_nodes_add_shared,
        math_nodes_add_execution,
        { id: "https://nodes.workflow.dog/math/add" }    
    ),
    "https://nodes.workflow.dog/math/absolute": _.merge({},
        math_nodes_absolute_shared,
        math_nodes_absolute_execution,
        { id: "https://nodes.workflow.dog/math/absolute" }    
    ),
    "https://nodes.workflow.dog/closecrm/list-leads": _.merge({},
        closecrm_nodes_list_leads_shared,
        closecrm_nodes_list_leads_execution,
        { id: "https://nodes.workflow.dog/closecrm/list-leads" }    
    ),
    "https://nodes.workflow.dog/closecrm/get-lead-by-id": _.merge({},
        closecrm_nodes_get_lead_by_id_shared,
        closecrm_nodes_get_lead_by_id_execution,
        { id: "https://nodes.workflow.dog/closecrm/get-lead-by-id" }    
    ),
    "https://nodes.workflow.dog/basic/xor": _.merge({},
        basic_nodes_xor_shared,
        basic_nodes_xor_execution,
        { id: "https://nodes.workflow.dog/basic/xor" }    
    ),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({},
        basic_nodes_trigger_input_shared,
        basic_nodes_trigger_input_execution,
        { id: "https://nodes.workflow.dog/basic/trigger-input" }    
    ),
    "https://nodes.workflow.dog/basic/text": _.merge({},
        basic_nodes_text_shared,
        basic_nodes_text_execution,
        { id: "https://nodes.workflow.dog/basic/text" }    
    ),
    "https://nodes.workflow.dog/basic/template": _.merge({},
        basic_nodes_template_shared,
        basic_nodes_template_execution,
        { id: "https://nodes.workflow.dog/basic/template" }    
    ),
    "https://nodes.workflow.dog/basic/switch": _.merge({},
        basic_nodes_switch_shared,
        basic_nodes_switch_execution,
        { id: "https://nodes.workflow.dog/basic/switch" }    
    ),
    "https://nodes.workflow.dog/basic/or": _.merge({},
        basic_nodes_or_shared,
        basic_nodes_or_execution,
        { id: "https://nodes.workflow.dog/basic/or" }    
    ),
    "https://nodes.workflow.dog/basic/number": _.merge({},
        basic_nodes_number_shared,
        basic_nodes_number_execution,
        { id: "https://nodes.workflow.dog/basic/number" }    
    ),
    "https://nodes.workflow.dog/basic/not-equal": _.merge({},
        basic_nodes_not_equal_shared,
        basic_nodes_not_equal_execution,
        { id: "https://nodes.workflow.dog/basic/not-equal" }    
    ),
    "https://nodes.workflow.dog/basic/not": _.merge({},
        basic_nodes_not_shared,
        basic_nodes_not_execution,
        { id: "https://nodes.workflow.dog/basic/not" }    
    ),
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({},
        basic_nodes_json_stringify_shared,
        basic_nodes_json_stringify_execution,
        { id: "https://nodes.workflow.dog/basic/json-stringify" }    
    ),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({},
        basic_nodes_json_parse_shared,
        basic_nodes_json_parse_execution,
        { id: "https://nodes.workflow.dog/basic/json-parse" }    
    ),
    "https://nodes.workflow.dog/basic/get-element": _.merge({},
        basic_nodes_get_element_shared,
        basic_nodes_get_element_execution,
        { id: "https://nodes.workflow.dog/basic/get-element" }    
    ),
    "https://nodes.workflow.dog/basic/equal": _.merge({},
        basic_nodes_equal_shared,
        basic_nodes_equal_execution,
        { id: "https://nodes.workflow.dog/basic/equal" }    
    ),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({},
        basic_nodes_decompose_object_shared,
        basic_nodes_decompose_object_execution,
        { id: "https://nodes.workflow.dog/basic/decompose-object" }    
    ),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({},
        basic_nodes_compose_object_shared,
        basic_nodes_compose_object_execution,
        { id: "https://nodes.workflow.dog/basic/compose-object" }    
    ),
    "https://nodes.workflow.dog/basic/compose-list": _.merge({},
        basic_nodes_compose_list_shared,
        basic_nodes_compose_list_execution,
        { id: "https://nodes.workflow.dog/basic/compose-list" }    
    ),
    "https://nodes.workflow.dog/basic/and": _.merge({},
        basic_nodes_and_shared,
        basic_nodes_and_execution,
        { id: "https://nodes.workflow.dog/basic/and" }    
    ),
} as Record<string, SharedNodeDefinition & ExecutionNodeDefinition<any> & { id: string }>)

export const TriggerDefinitions = createExport({

} as Record<string, any & { id: string }>)

export const ServiceDefinitions = createExport({

} as Record<string, any & { id: string }>)

export const DataTypeDefinitions = createExport({

} as Record<string, any & { id: string }>)