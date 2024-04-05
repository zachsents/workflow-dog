import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedClientNodeDefinition } from "@pkg/types"
import basic_nodes_and_client from "../../basic/nodes/and/client"
import basic_nodes_compose_list_client from "../../basic/nodes/compose-list/client"
import basic_nodes_compose_object_client from "../../basic/nodes/compose-object/client"
import basic_nodes_decompose_object_client from "../../basic/nodes/decompose-object/client"
import basic_nodes_equal_client from "../../basic/nodes/equal/client"
import basic_nodes_get_element_client from "../../basic/nodes/get-element/client"
import basic_nodes_json_parse_client from "../../basic/nodes/json-parse/client"
import basic_nodes_json_stringify_client from "../../basic/nodes/json-stringify/client"
import basic_nodes_not_client from "../../basic/nodes/not/client"
import basic_nodes_not_equal_client from "../../basic/nodes/not-equal/client"
import basic_nodes_number_client from "../../basic/nodes/number/client"
import basic_nodes_or_client from "../../basic/nodes/or/client"
import basic_nodes_switch_client from "../../basic/nodes/switch/client"
import basic_nodes_template_client from "../../basic/nodes/template/client"
import basic_nodes_text_client from "../../basic/nodes/text/client"
import basic_nodes_trigger_input_client from "../../basic/nodes/trigger-input/client"
import basic_nodes_xor_client from "../../basic/nodes/xor/client"
import closecrm_nodes_get_lead_by_id_client from "../../closecrm/nodes/get-lead-by-id/client"
import closecrm_nodes_list_leads_client from "../../closecrm/nodes/list-leads/client"
import google_nodes_gmail_send_email_client from "../../google/nodes/gmail-send-email/client"
import math_nodes_absolute_client from "../../math/nodes/absolute/client"
import math_nodes_add_client from "../../math/nodes/add/client"
import math_nodes_ceiling_client from "../../math/nodes/ceiling/client"
import math_nodes_cos_client from "../../math/nodes/cos/client"
import math_nodes_divide_client from "../../math/nodes/divide/client"
import math_nodes_e_client from "../../math/nodes/e/client"
import math_nodes_exponent_client from "../../math/nodes/exponent/client"
import math_nodes_floor_client from "../../math/nodes/floor/client"
import math_nodes_greater_than_client from "../../math/nodes/greater-than/client"
import math_nodes_less_than_client from "../../math/nodes/less-than/client"
import math_nodes_log_client from "../../math/nodes/log/client"
import math_nodes_max_client from "../../math/nodes/max/client"
import math_nodes_min_client from "../../math/nodes/min/client"
import math_nodes_multiply_client from "../../math/nodes/multiply/client"
import math_nodes_natural_log_client from "../../math/nodes/natural-log/client"
import math_nodes_pi_client from "../../math/nodes/pi/client"
import math_nodes_round_client from "../../math/nodes/round/client"
import math_nodes_sin_client from "../../math/nodes/sin/client"
import math_nodes_square_root_client from "../../math/nodes/square-root/client"
import math_nodes_subtract_client from "../../math/nodes/subtract/client"
import math_nodes_sum_client from "../../math/nodes/sum/client"
import math_nodes_tan_client from "../../math/nodes/tan/client"
import openai_nodes_prompt_chatgpt_client from "../../openai/nodes/prompt-chatgpt/client"


const _definitions = {
    // EXPORTS
    "https://nodes.workflow.dog/basic/and": _.merge({ id: "https://nodes.workflow.dog/basic/and" }, basic_nodes_and_client),
    "https://nodes.workflow.dog/basic/compose-list": _.merge({ id: "https://nodes.workflow.dog/basic/compose-list" }, basic_nodes_compose_list_client),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({ id: "https://nodes.workflow.dog/basic/compose-object" }, basic_nodes_compose_object_client),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({ id: "https://nodes.workflow.dog/basic/decompose-object" }, basic_nodes_decompose_object_client),
    "https://nodes.workflow.dog/basic/equal": _.merge({ id: "https://nodes.workflow.dog/basic/equal" }, basic_nodes_equal_client),
    "https://nodes.workflow.dog/basic/get-element": _.merge({ id: "https://nodes.workflow.dog/basic/get-element" }, basic_nodes_get_element_client),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({ id: "https://nodes.workflow.dog/basic/json-parse" }, basic_nodes_json_parse_client),
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({ id: "https://nodes.workflow.dog/basic/json-stringify" }, basic_nodes_json_stringify_client),
    "https://nodes.workflow.dog/basic/not": _.merge({ id: "https://nodes.workflow.dog/basic/not" }, basic_nodes_not_client),
    "https://nodes.workflow.dog/basic/not-equal": _.merge({ id: "https://nodes.workflow.dog/basic/not-equal" }, basic_nodes_not_equal_client),
    "https://nodes.workflow.dog/basic/number": _.merge({ id: "https://nodes.workflow.dog/basic/number" }, basic_nodes_number_client),
    "https://nodes.workflow.dog/basic/or": _.merge({ id: "https://nodes.workflow.dog/basic/or" }, basic_nodes_or_client),
    "https://nodes.workflow.dog/basic/switch": _.merge({ id: "https://nodes.workflow.dog/basic/switch" }, basic_nodes_switch_client),
    "https://nodes.workflow.dog/basic/template": _.merge({ id: "https://nodes.workflow.dog/basic/template" }, basic_nodes_template_client),
    "https://nodes.workflow.dog/basic/text": _.merge({ id: "https://nodes.workflow.dog/basic/text" }, basic_nodes_text_client),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({ id: "https://nodes.workflow.dog/basic/trigger-input" }, basic_nodes_trigger_input_client),
    "https://nodes.workflow.dog/basic/xor": _.merge({ id: "https://nodes.workflow.dog/basic/xor" }, basic_nodes_xor_client),
    "https://nodes.workflow.dog/closecrm/get-lead-by-id": _.merge({ id: "https://nodes.workflow.dog/closecrm/get-lead-by-id" }, closecrm_nodes_get_lead_by_id_client),
    "https://nodes.workflow.dog/closecrm/list-leads": _.merge({ id: "https://nodes.workflow.dog/closecrm/list-leads" }, closecrm_nodes_list_leads_client),
    "https://nodes.workflow.dog/google/gmail-send-email": _.merge({ id: "https://nodes.workflow.dog/google/gmail-send-email" }, google_nodes_gmail_send_email_client),
    "https://nodes.workflow.dog/math/absolute": _.merge({ id: "https://nodes.workflow.dog/math/absolute" }, math_nodes_absolute_client),
    "https://nodes.workflow.dog/math/add": _.merge({ id: "https://nodes.workflow.dog/math/add" }, math_nodes_add_client),
    "https://nodes.workflow.dog/math/ceiling": _.merge({ id: "https://nodes.workflow.dog/math/ceiling" }, math_nodes_ceiling_client),
    "https://nodes.workflow.dog/math/cos": _.merge({ id: "https://nodes.workflow.dog/math/cos" }, math_nodes_cos_client),
    "https://nodes.workflow.dog/math/divide": _.merge({ id: "https://nodes.workflow.dog/math/divide" }, math_nodes_divide_client),
    "https://nodes.workflow.dog/math/e": _.merge({ id: "https://nodes.workflow.dog/math/e" }, math_nodes_e_client),
    "https://nodes.workflow.dog/math/exponent": _.merge({ id: "https://nodes.workflow.dog/math/exponent" }, math_nodes_exponent_client),
    "https://nodes.workflow.dog/math/floor": _.merge({ id: "https://nodes.workflow.dog/math/floor" }, math_nodes_floor_client),
    "https://nodes.workflow.dog/math/greater-than": _.merge({ id: "https://nodes.workflow.dog/math/greater-than" }, math_nodes_greater_than_client),
    "https://nodes.workflow.dog/math/less-than": _.merge({ id: "https://nodes.workflow.dog/math/less-than" }, math_nodes_less_than_client),
    "https://nodes.workflow.dog/math/log": _.merge({ id: "https://nodes.workflow.dog/math/log" }, math_nodes_log_client),
    "https://nodes.workflow.dog/math/max": _.merge({ id: "https://nodes.workflow.dog/math/max" }, math_nodes_max_client),
    "https://nodes.workflow.dog/math/min": _.merge({ id: "https://nodes.workflow.dog/math/min" }, math_nodes_min_client),
    "https://nodes.workflow.dog/math/multiply": _.merge({ id: "https://nodes.workflow.dog/math/multiply" }, math_nodes_multiply_client),
    "https://nodes.workflow.dog/math/natural-log": _.merge({ id: "https://nodes.workflow.dog/math/natural-log" }, math_nodes_natural_log_client),
    "https://nodes.workflow.dog/math/pi": _.merge({ id: "https://nodes.workflow.dog/math/pi" }, math_nodes_pi_client),
    "https://nodes.workflow.dog/math/round": _.merge({ id: "https://nodes.workflow.dog/math/round" }, math_nodes_round_client),
    "https://nodes.workflow.dog/math/sin": _.merge({ id: "https://nodes.workflow.dog/math/sin" }, math_nodes_sin_client),
    "https://nodes.workflow.dog/math/square-root": _.merge({ id: "https://nodes.workflow.dog/math/square-root" }, math_nodes_square_root_client),
    "https://nodes.workflow.dog/math/subtract": _.merge({ id: "https://nodes.workflow.dog/math/subtract" }, math_nodes_subtract_client),
    "https://nodes.workflow.dog/math/sum": _.merge({ id: "https://nodes.workflow.dog/math/sum" }, math_nodes_sum_client),
    "https://nodes.workflow.dog/math/tan": _.merge({ id: "https://nodes.workflow.dog/math/tan" }, math_nodes_tan_client),
    "https://nodes.workflow.dog/openai/prompt-chatgpt": _.merge({ id: "https://nodes.workflow.dog/openai/prompt-chatgpt" }, openai_nodes_prompt_chatgpt_client),
}

export const Definitions = createExport<MergedClientNodeDefinition, typeof _definitions>(_definitions)
