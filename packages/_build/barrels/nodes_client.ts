import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedClientNodeDefinition } from "@pkg/types"
import basic_nodes_and_client from "../../basic/nodes/and/client"
import basic_nodes_coalesce_falsy_client from "../../basic/nodes/coalesce-falsy/client"
import basic_nodes_coalesce_nullish_client from "../../basic/nodes/coalesce-nullish/client"
import basic_nodes_compose_list_client from "../../basic/nodes/compose-list/client"
import basic_nodes_compose_object_client from "../../basic/nodes/compose-object/client"
import basic_nodes_convert_to_number_client from "../../basic/nodes/convert-to-number/client"
import basic_nodes_decompose_object_client from "../../basic/nodes/decompose-object/client"
import basic_nodes_equal_client from "../../basic/nodes/equal/client"
import basic_nodes_get_element_client from "../../basic/nodes/get-element/client"
import basic_nodes_json_parse_client from "../../basic/nodes/json-parse/client"
import basic_nodes_json_stringify_client from "../../basic/nodes/json-stringify/client"
import basic_nodes_list_append_client from "../../basic/nodes/list-append/client"
import basic_nodes_loop_workflow_client from "../../basic/nodes/loop-workflow/client"
import basic_nodes_not_client from "../../basic/nodes/not/client"
import basic_nodes_not_equal_client from "../../basic/nodes/not-equal/client"
import basic_nodes_number_client from "../../basic/nodes/number/client"
import basic_nodes_or_client from "../../basic/nodes/or/client"
import basic_nodes_run_workflow_client from "../../basic/nodes/run-workflow/client"
import basic_nodes_switch_client from "../../basic/nodes/switch/client"
import basic_nodes_text_client from "../../basic/nodes/text/client"
import basic_nodes_trigger_input_client from "../../basic/nodes/trigger-input/client"
import basic_nodes_xor_client from "../../basic/nodes/xor/client"
import closecrm_nodes_get_lead_by_id_client from "../../closecrm/nodes/get-lead-by-id/client"
import closecrm_nodes_list_leads_client from "../../closecrm/nodes/list-leads/client"
import google_nodes_gmail_add_labels_client from "../../google/nodes/gmail-add-labels/client"
import google_nodes_gmail_create_draft_client from "../../google/nodes/gmail-create-draft/client"
import google_nodes_gmail_create_draft_reply_client from "../../google/nodes/gmail-create-draft-reply/client"
import google_nodes_gmail_get_attachment_client from "../../google/nodes/gmail-get-attachment/client"
import google_nodes_gmail_get_message_client from "../../google/nodes/gmail-get-message/client"
import google_nodes_gmail_mark_as_read_client from "../../google/nodes/gmail-mark-as-read/client"
import google_nodes_gmail_mark_as_unread_client from "../../google/nodes/gmail-mark-as-unread/client"
import google_nodes_gmail_remove_labels_client from "../../google/nodes/gmail-remove-labels/client"
import google_nodes_gmail_reply_to_email_client from "../../google/nodes/gmail-reply-to-email/client"
import google_nodes_gmail_send_email_client from "../../google/nodes/gmail-send-email/client"
import google_nodes_gmail_trash_message_client from "../../google/nodes/gmail-trash-message/client"
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
import openai_nodes_classify_client from "../../openai/nodes/classify/client"
import openai_nodes_generate_image_client from "../../openai/nodes/generate-image/client"
import openai_nodes_moderate_client from "../../openai/nodes/moderate/client"
import openai_nodes_parse_client from "../../openai/nodes/parse/client"
import openai_nodes_prompt_chatgpt_client from "../../openai/nodes/prompt-chatgpt/client"
import openai_nodes_prompt_chatgpt_vision_client from "../../openai/nodes/prompt-chatgpt-vision/client"
import openai_nodes_speech_to_text_client from "../../openai/nodes/speech-to-text/client"
import openai_nodes_text_to_speech_client from "../../openai/nodes/text-to-speech/client"
import openai_nodes_yes_no_decision_client from "../../openai/nodes/yes-no-decision/client"
import text_nodes_concatenate_client from "../../text/nodes/concatenate/client"
import text_nodes_contains_client from "../../text/nodes/contains/client"
import text_nodes_convert_to_regex_client from "../../text/nodes/convert-to-regex/client"
import text_nodes_convert_to_text_client from "../../text/nodes/convert-to-text/client"
import text_nodes_count_occurrences_client from "../../text/nodes/count-occurrences/client"
import text_nodes_length_client from "../../text/nodes/length/client"
import text_nodes_lowercase_client from "../../text/nodes/lowercase/client"
import text_nodes_regex_client from "../../text/nodes/regex/client"
import text_nodes_regex_search_client from "../../text/nodes/regex-search/client"
import text_nodes_regex_search_multiple_client from "../../text/nodes/regex-search-multiple/client"
import text_nodes_regex_test_client from "../../text/nodes/regex-test/client"
import text_nodes_replace_client from "../../text/nodes/replace/client"
import text_nodes_slice_client from "../../text/nodes/slice/client"
import text_nodes_split_client from "../../text/nodes/split/client"
import text_nodes_split_into_list_client from "../../text/nodes/split-into-list/client"
import text_nodes_template_client from "../../text/nodes/template/client"
import text_nodes_trim_whitespace_client from "../../text/nodes/trim-whitespace/client"
import text_nodes_uppercase_client from "../../text/nodes/uppercase/client"


const _definitions = {
    // EXPORTS
    "https://nodes.workflow.dog/basic/and": _.merge({ id: "https://nodes.workflow.dog/basic/and" }, basic_nodes_and_client),
    "https://nodes.workflow.dog/basic/coalesce-falsy": _.merge({ id: "https://nodes.workflow.dog/basic/coalesce-falsy" }, basic_nodes_coalesce_falsy_client),
    "https://nodes.workflow.dog/basic/coalesce-nullish": _.merge({ id: "https://nodes.workflow.dog/basic/coalesce-nullish" }, basic_nodes_coalesce_nullish_client),
    "https://nodes.workflow.dog/basic/compose-list": _.merge({ id: "https://nodes.workflow.dog/basic/compose-list" }, basic_nodes_compose_list_client),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({ id: "https://nodes.workflow.dog/basic/compose-object" }, basic_nodes_compose_object_client),
    "https://nodes.workflow.dog/basic/convert-to-number": _.merge({ id: "https://nodes.workflow.dog/basic/convert-to-number" }, basic_nodes_convert_to_number_client),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({ id: "https://nodes.workflow.dog/basic/decompose-object" }, basic_nodes_decompose_object_client),
    "https://nodes.workflow.dog/basic/equal": _.merge({ id: "https://nodes.workflow.dog/basic/equal" }, basic_nodes_equal_client),
    "https://nodes.workflow.dog/basic/get-element": _.merge({ id: "https://nodes.workflow.dog/basic/get-element" }, basic_nodes_get_element_client),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({ id: "https://nodes.workflow.dog/basic/json-parse" }, basic_nodes_json_parse_client),
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({ id: "https://nodes.workflow.dog/basic/json-stringify" }, basic_nodes_json_stringify_client),
    "https://nodes.workflow.dog/basic/list-append": _.merge({ id: "https://nodes.workflow.dog/basic/list-append" }, basic_nodes_list_append_client),
    "https://nodes.workflow.dog/basic/loop-workflow": _.merge({ id: "https://nodes.workflow.dog/basic/loop-workflow" }, basic_nodes_loop_workflow_client),
    "https://nodes.workflow.dog/basic/not": _.merge({ id: "https://nodes.workflow.dog/basic/not" }, basic_nodes_not_client),
    "https://nodes.workflow.dog/basic/not-equal": _.merge({ id: "https://nodes.workflow.dog/basic/not-equal" }, basic_nodes_not_equal_client),
    "https://nodes.workflow.dog/basic/number": _.merge({ id: "https://nodes.workflow.dog/basic/number" }, basic_nodes_number_client),
    "https://nodes.workflow.dog/basic/or": _.merge({ id: "https://nodes.workflow.dog/basic/or" }, basic_nodes_or_client),
    "https://nodes.workflow.dog/basic/run-workflow": _.merge({ id: "https://nodes.workflow.dog/basic/run-workflow" }, basic_nodes_run_workflow_client),
    "https://nodes.workflow.dog/basic/switch": _.merge({ id: "https://nodes.workflow.dog/basic/switch" }, basic_nodes_switch_client),
    "https://nodes.workflow.dog/basic/text": _.merge({ id: "https://nodes.workflow.dog/basic/text" }, basic_nodes_text_client),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({ id: "https://nodes.workflow.dog/basic/trigger-input" }, basic_nodes_trigger_input_client),
    "https://nodes.workflow.dog/basic/xor": _.merge({ id: "https://nodes.workflow.dog/basic/xor" }, basic_nodes_xor_client),
    "https://nodes.workflow.dog/closecrm/get-lead-by-id": _.merge({ id: "https://nodes.workflow.dog/closecrm/get-lead-by-id" }, closecrm_nodes_get_lead_by_id_client),
    "https://nodes.workflow.dog/closecrm/list-leads": _.merge({ id: "https://nodes.workflow.dog/closecrm/list-leads" }, closecrm_nodes_list_leads_client),
    "https://nodes.workflow.dog/google/gmail-add-labels": _.merge({ id: "https://nodes.workflow.dog/google/gmail-add-labels" }, google_nodes_gmail_add_labels_client),
    "https://nodes.workflow.dog/google/gmail-create-draft": _.merge({ id: "https://nodes.workflow.dog/google/gmail-create-draft" }, google_nodes_gmail_create_draft_client),
    "https://nodes.workflow.dog/google/gmail-create-draft-reply": _.merge({ id: "https://nodes.workflow.dog/google/gmail-create-draft-reply" }, google_nodes_gmail_create_draft_reply_client),
    "https://nodes.workflow.dog/google/gmail-get-attachment": _.merge({ id: "https://nodes.workflow.dog/google/gmail-get-attachment" }, google_nodes_gmail_get_attachment_client),
    "https://nodes.workflow.dog/google/gmail-get-message": _.merge({ id: "https://nodes.workflow.dog/google/gmail-get-message" }, google_nodes_gmail_get_message_client),
    "https://nodes.workflow.dog/google/gmail-mark-as-read": _.merge({ id: "https://nodes.workflow.dog/google/gmail-mark-as-read" }, google_nodes_gmail_mark_as_read_client),
    "https://nodes.workflow.dog/google/gmail-mark-as-unread": _.merge({ id: "https://nodes.workflow.dog/google/gmail-mark-as-unread" }, google_nodes_gmail_mark_as_unread_client),
    "https://nodes.workflow.dog/google/gmail-remove-labels": _.merge({ id: "https://nodes.workflow.dog/google/gmail-remove-labels" }, google_nodes_gmail_remove_labels_client),
    "https://nodes.workflow.dog/google/gmail-reply-to-email": _.merge({ id: "https://nodes.workflow.dog/google/gmail-reply-to-email" }, google_nodes_gmail_reply_to_email_client),
    "https://nodes.workflow.dog/google/gmail-send-email": _.merge({ id: "https://nodes.workflow.dog/google/gmail-send-email" }, google_nodes_gmail_send_email_client),
    "https://nodes.workflow.dog/google/gmail-trash-message": _.merge({ id: "https://nodes.workflow.dog/google/gmail-trash-message" }, google_nodes_gmail_trash_message_client),
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
    "https://nodes.workflow.dog/openai/classify": _.merge({ id: "https://nodes.workflow.dog/openai/classify" }, openai_nodes_classify_client),
    "https://nodes.workflow.dog/openai/generate-image": _.merge({ id: "https://nodes.workflow.dog/openai/generate-image" }, openai_nodes_generate_image_client),
    "https://nodes.workflow.dog/openai/moderate": _.merge({ id: "https://nodes.workflow.dog/openai/moderate" }, openai_nodes_moderate_client),
    "https://nodes.workflow.dog/openai/parse": _.merge({ id: "https://nodes.workflow.dog/openai/parse" }, openai_nodes_parse_client),
    "https://nodes.workflow.dog/openai/prompt-chatgpt": _.merge({ id: "https://nodes.workflow.dog/openai/prompt-chatgpt" }, openai_nodes_prompt_chatgpt_client),
    "https://nodes.workflow.dog/openai/prompt-chatgpt-vision": _.merge({ id: "https://nodes.workflow.dog/openai/prompt-chatgpt-vision" }, openai_nodes_prompt_chatgpt_vision_client),
    "https://nodes.workflow.dog/openai/speech-to-text": _.merge({ id: "https://nodes.workflow.dog/openai/speech-to-text" }, openai_nodes_speech_to_text_client),
    "https://nodes.workflow.dog/openai/text-to-speech": _.merge({ id: "https://nodes.workflow.dog/openai/text-to-speech" }, openai_nodes_text_to_speech_client),
    "https://nodes.workflow.dog/openai/yes-no-decision": _.merge({ id: "https://nodes.workflow.dog/openai/yes-no-decision" }, openai_nodes_yes_no_decision_client),
    "https://nodes.workflow.dog/text/concatenate": _.merge({ id: "https://nodes.workflow.dog/text/concatenate" }, text_nodes_concatenate_client),
    "https://nodes.workflow.dog/text/contains": _.merge({ id: "https://nodes.workflow.dog/text/contains" }, text_nodes_contains_client),
    "https://nodes.workflow.dog/text/convert-to-regex": _.merge({ id: "https://nodes.workflow.dog/text/convert-to-regex" }, text_nodes_convert_to_regex_client),
    "https://nodes.workflow.dog/text/convert-to-text": _.merge({ id: "https://nodes.workflow.dog/text/convert-to-text" }, text_nodes_convert_to_text_client),
    "https://nodes.workflow.dog/text/count-occurrences": _.merge({ id: "https://nodes.workflow.dog/text/count-occurrences" }, text_nodes_count_occurrences_client),
    "https://nodes.workflow.dog/text/length": _.merge({ id: "https://nodes.workflow.dog/text/length" }, text_nodes_length_client),
    "https://nodes.workflow.dog/text/lowercase": _.merge({ id: "https://nodes.workflow.dog/text/lowercase" }, text_nodes_lowercase_client),
    "https://nodes.workflow.dog/text/regex": _.merge({ id: "https://nodes.workflow.dog/text/regex" }, text_nodes_regex_client),
    "https://nodes.workflow.dog/text/regex-search": _.merge({ id: "https://nodes.workflow.dog/text/regex-search" }, text_nodes_regex_search_client),
    "https://nodes.workflow.dog/text/regex-search-multiple": _.merge({ id: "https://nodes.workflow.dog/text/regex-search-multiple" }, text_nodes_regex_search_multiple_client),
    "https://nodes.workflow.dog/text/regex-test": _.merge({ id: "https://nodes.workflow.dog/text/regex-test" }, text_nodes_regex_test_client),
    "https://nodes.workflow.dog/text/replace": _.merge({ id: "https://nodes.workflow.dog/text/replace" }, text_nodes_replace_client),
    "https://nodes.workflow.dog/text/slice": _.merge({ id: "https://nodes.workflow.dog/text/slice" }, text_nodes_slice_client),
    "https://nodes.workflow.dog/text/split": _.merge({ id: "https://nodes.workflow.dog/text/split" }, text_nodes_split_client),
    "https://nodes.workflow.dog/text/split-into-list": _.merge({ id: "https://nodes.workflow.dog/text/split-into-list" }, text_nodes_split_into_list_client),
    "https://nodes.workflow.dog/text/template": _.merge({ id: "https://nodes.workflow.dog/text/template" }, text_nodes_template_client),
    "https://nodes.workflow.dog/text/trim-whitespace": _.merge({ id: "https://nodes.workflow.dog/text/trim-whitespace" }, text_nodes_trim_whitespace_client),
    "https://nodes.workflow.dog/text/uppercase": _.merge({ id: "https://nodes.workflow.dog/text/uppercase" }, text_nodes_uppercase_client),
}

export const Definitions = createExport<MergedClientNodeDefinition, typeof _definitions>(_definitions)
