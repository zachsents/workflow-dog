import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedExecutionNodeDefinition } from "@pkg/types"
import basic_nodes_and_execution from "../../basic/nodes/and/execution"
import basic_nodes_choose_value_execution from "../../basic/nodes/choose-value/execution"
import basic_nodes_coalesce_falsy_execution from "../../basic/nodes/coalesce-falsy/execution"
import basic_nodes_coalesce_nullish_execution from "../../basic/nodes/coalesce-nullish/execution"
import basic_nodes_compose_list_execution from "../../basic/nodes/compose-list/execution"
import basic_nodes_compose_object_execution from "../../basic/nodes/compose-object/execution"
import basic_nodes_convert_to_number_execution from "../../basic/nodes/convert-to-number/execution"
import basic_nodes_datetime_execution from "../../basic/nodes/datetime/execution"
import basic_nodes_decompose_object_execution from "../../basic/nodes/decompose-object/execution"
import basic_nodes_equal_execution from "../../basic/nodes/equal/execution"
import basic_nodes_get_element_execution from "../../basic/nodes/get-element/execution"
import basic_nodes_get_project_variable_execution from "../../basic/nodes/get-project-variable/execution"
import basic_nodes_json_parse_execution from "../../basic/nodes/json-parse/execution"
import basic_nodes_json_stringify_execution from "../../basic/nodes/json-stringify/execution"
import basic_nodes_list_append_execution from "../../basic/nodes/list-append/execution"
import basic_nodes_list_get_first_execution from "../../basic/nodes/list-get-first/execution"
import basic_nodes_list_get_last_execution from "../../basic/nodes/list-get-last/execution"
import basic_nodes_loop_workflow_execution from "../../basic/nodes/loop-workflow/execution"
import basic_nodes_loop_workflow_staggered_execution from "../../basic/nodes/loop-workflow-staggered/execution"
import basic_nodes_not_execution from "../../basic/nodes/not/execution"
import basic_nodes_not_equal_execution from "../../basic/nodes/not-equal/execution"
import basic_nodes_number_execution from "../../basic/nodes/number/execution"
import basic_nodes_or_execution from "../../basic/nodes/or/execution"
import basic_nodes_run_workflow_execution from "../../basic/nodes/run-workflow/execution"
import basic_nodes_set_project_variable_execution from "../../basic/nodes/set-project-variable/execution"
import basic_nodes_switch_execution from "../../basic/nodes/switch/execution"
import basic_nodes_text_execution from "../../basic/nodes/text/execution"
import basic_nodes_trigger_input_execution from "../../basic/nodes/trigger-input/execution"
import basic_nodes_trigger_webhook_execution from "../../basic/nodes/trigger-webhook/execution"
import basic_nodes_xor_execution from "../../basic/nodes/xor/execution"
import closecrm_nodes_get_contact_by_id_execution from "../../closecrm/nodes/get-contact-by-id/execution"
import closecrm_nodes_get_contacts_for_lead_execution from "../../closecrm/nodes/get-contacts-for-lead/execution"
import closecrm_nodes_get_lead_by_id_execution from "../../closecrm/nodes/get-lead-by-id/execution"
import closecrm_nodes_list_contacts_execution from "../../closecrm/nodes/list-contacts/execution"
import closecrm_nodes_list_emails_with_lead_execution from "../../closecrm/nodes/list-emails-with-lead/execution"
import closecrm_nodes_list_leads_execution from "../../closecrm/nodes/list-leads/execution"
import closecrm_nodes_list_leads_in_smart_view_execution from "../../closecrm/nodes/list-leads-in-smart-view/execution"
import closecrm_nodes_subscribe_contact_in_sequence_execution from "../../closecrm/nodes/subscribe-contact-in-sequence/execution"
import google_nodes_gmail_add_labels_execution from "../../google/nodes/gmail-add-labels/execution"
import google_nodes_gmail_create_draft_execution from "../../google/nodes/gmail-create-draft/execution"
import google_nodes_gmail_create_draft_reply_execution from "../../google/nodes/gmail-create-draft-reply/execution"
import google_nodes_gmail_get_attachment_execution from "../../google/nodes/gmail-get-attachment/execution"
import google_nodes_gmail_get_message_execution from "../../google/nodes/gmail-get-message/execution"
import google_nodes_gmail_mark_as_read_execution from "../../google/nodes/gmail-mark-as-read/execution"
import google_nodes_gmail_mark_as_unread_execution from "../../google/nodes/gmail-mark-as-unread/execution"
import google_nodes_gmail_remove_labels_execution from "../../google/nodes/gmail-remove-labels/execution"
import google_nodes_gmail_reply_to_email_execution from "../../google/nodes/gmail-reply-to-email/execution"
import google_nodes_gmail_send_email_execution from "../../google/nodes/gmail-send-email/execution"
import google_nodes_gmail_trash_message_execution from "../../google/nodes/gmail-trash-message/execution"
import math_nodes_absolute_execution from "../../math/nodes/absolute/execution"
import math_nodes_add_execution from "../../math/nodes/add/execution"
import math_nodes_ceiling_execution from "../../math/nodes/ceiling/execution"
import math_nodes_cos_execution from "../../math/nodes/cos/execution"
import math_nodes_divide_execution from "../../math/nodes/divide/execution"
import math_nodes_e_execution from "../../math/nodes/e/execution"
import math_nodes_exponent_execution from "../../math/nodes/exponent/execution"
import math_nodes_floor_execution from "../../math/nodes/floor/execution"
import math_nodes_greater_than_execution from "../../math/nodes/greater-than/execution"
import math_nodes_less_than_execution from "../../math/nodes/less-than/execution"
import math_nodes_log_execution from "../../math/nodes/log/execution"
import math_nodes_max_execution from "../../math/nodes/max/execution"
import math_nodes_min_execution from "../../math/nodes/min/execution"
import math_nodes_multiply_execution from "../../math/nodes/multiply/execution"
import math_nodes_natural_log_execution from "../../math/nodes/natural-log/execution"
import math_nodes_pi_execution from "../../math/nodes/pi/execution"
import math_nodes_round_execution from "../../math/nodes/round/execution"
import math_nodes_sin_execution from "../../math/nodes/sin/execution"
import math_nodes_square_root_execution from "../../math/nodes/square-root/execution"
import math_nodes_subtract_execution from "../../math/nodes/subtract/execution"
import math_nodes_sum_execution from "../../math/nodes/sum/execution"
import math_nodes_tan_execution from "../../math/nodes/tan/execution"
import openai_nodes_classify_execution from "../../openai/nodes/classify/execution"
import openai_nodes_generate_image_execution from "../../openai/nodes/generate-image/execution"
import openai_nodes_moderate_execution from "../../openai/nodes/moderate/execution"
import openai_nodes_parse_execution from "../../openai/nodes/parse/execution"
import openai_nodes_prompt_chatgpt_execution from "../../openai/nodes/prompt-chatgpt/execution"
import openai_nodes_prompt_chatgpt_vision_execution from "../../openai/nodes/prompt-chatgpt-vision/execution"
import openai_nodes_speech_to_text_execution from "../../openai/nodes/speech-to-text/execution"
import openai_nodes_yes_no_decision_execution from "../../openai/nodes/yes-no-decision/execution"
import openai_nodes_text_to_speech_execution from "../../openai/nodes/text-to-speech/execution"
import text_nodes_concatenate_execution from "../../text/nodes/concatenate/execution"
import text_nodes_contains_execution from "../../text/nodes/contains/execution"
import text_nodes_convert_to_regex_execution from "../../text/nodes/convert-to-regex/execution"
import text_nodes_convert_to_text_execution from "../../text/nodes/convert-to-text/execution"
import text_nodes_count_occurrences_execution from "../../text/nodes/count-occurrences/execution"
import text_nodes_length_execution from "../../text/nodes/length/execution"
import text_nodes_lowercase_execution from "../../text/nodes/lowercase/execution"
import text_nodes_regex_execution from "../../text/nodes/regex/execution"
import text_nodes_regex_search_execution from "../../text/nodes/regex-search/execution"
import text_nodes_regex_search_multiple_execution from "../../text/nodes/regex-search-multiple/execution"
import text_nodes_regex_test_execution from "../../text/nodes/regex-test/execution"
import text_nodes_replace_execution from "../../text/nodes/replace/execution"
import text_nodes_slice_execution from "../../text/nodes/slice/execution"
import text_nodes_split_execution from "../../text/nodes/split/execution"
import text_nodes_split_into_list_execution from "../../text/nodes/split-into-list/execution"
import text_nodes_template_execution from "../../text/nodes/template/execution"
import text_nodes_trim_whitespace_execution from "../../text/nodes/trim-whitespace/execution"
import text_nodes_uppercase_execution from "../../text/nodes/uppercase/execution"


const _definitions = {
    // EXPORTS
    "https://nodes.workflow.dog/basic/and": _.merge({ id: "https://nodes.workflow.dog/basic/and" }, basic_nodes_and_execution),
    "https://nodes.workflow.dog/basic/choose-value": _.merge({ id: "https://nodes.workflow.dog/basic/choose-value" }, basic_nodes_choose_value_execution),
    "https://nodes.workflow.dog/basic/coalesce-falsy": _.merge({ id: "https://nodes.workflow.dog/basic/coalesce-falsy" }, basic_nodes_coalesce_falsy_execution),
    "https://nodes.workflow.dog/basic/coalesce-nullish": _.merge({ id: "https://nodes.workflow.dog/basic/coalesce-nullish" }, basic_nodes_coalesce_nullish_execution),
    "https://nodes.workflow.dog/basic/compose-list": _.merge({ id: "https://nodes.workflow.dog/basic/compose-list" }, basic_nodes_compose_list_execution),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({ id: "https://nodes.workflow.dog/basic/compose-object" }, basic_nodes_compose_object_execution),
    "https://nodes.workflow.dog/basic/convert-to-number": _.merge({ id: "https://nodes.workflow.dog/basic/convert-to-number" }, basic_nodes_convert_to_number_execution),
    "https://nodes.workflow.dog/basic/datetime": _.merge({ id: "https://nodes.workflow.dog/basic/datetime" }, basic_nodes_datetime_execution),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({ id: "https://nodes.workflow.dog/basic/decompose-object" }, basic_nodes_decompose_object_execution),
    "https://nodes.workflow.dog/basic/equal": _.merge({ id: "https://nodes.workflow.dog/basic/equal" }, basic_nodes_equal_execution),
    "https://nodes.workflow.dog/basic/get-element": _.merge({ id: "https://nodes.workflow.dog/basic/get-element" }, basic_nodes_get_element_execution),
    "https://nodes.workflow.dog/basic/get-project-variable": _.merge({ id: "https://nodes.workflow.dog/basic/get-project-variable" }, basic_nodes_get_project_variable_execution),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({ id: "https://nodes.workflow.dog/basic/json-parse" }, basic_nodes_json_parse_execution),
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({ id: "https://nodes.workflow.dog/basic/json-stringify" }, basic_nodes_json_stringify_execution),
    "https://nodes.workflow.dog/basic/list-append": _.merge({ id: "https://nodes.workflow.dog/basic/list-append" }, basic_nodes_list_append_execution),
    "https://nodes.workflow.dog/basic/list-get-first": _.merge({ id: "https://nodes.workflow.dog/basic/list-get-first" }, basic_nodes_list_get_first_execution),
    "https://nodes.workflow.dog/basic/list-get-last": _.merge({ id: "https://nodes.workflow.dog/basic/list-get-last" }, basic_nodes_list_get_last_execution),
    "https://nodes.workflow.dog/basic/loop-workflow": _.merge({ id: "https://nodes.workflow.dog/basic/loop-workflow" }, basic_nodes_loop_workflow_execution),
    "https://nodes.workflow.dog/basic/loop-workflow-staggered": _.merge({ id: "https://nodes.workflow.dog/basic/loop-workflow-staggered" }, basic_nodes_loop_workflow_staggered_execution),
    "https://nodes.workflow.dog/basic/not": _.merge({ id: "https://nodes.workflow.dog/basic/not" }, basic_nodes_not_execution),
    "https://nodes.workflow.dog/basic/not-equal": _.merge({ id: "https://nodes.workflow.dog/basic/not-equal" }, basic_nodes_not_equal_execution),
    "https://nodes.workflow.dog/basic/number": _.merge({ id: "https://nodes.workflow.dog/basic/number" }, basic_nodes_number_execution),
    "https://nodes.workflow.dog/basic/or": _.merge({ id: "https://nodes.workflow.dog/basic/or" }, basic_nodes_or_execution),
    "https://nodes.workflow.dog/basic/run-workflow": _.merge({ id: "https://nodes.workflow.dog/basic/run-workflow" }, basic_nodes_run_workflow_execution),
    "https://nodes.workflow.dog/basic/set-project-variable": _.merge({ id: "https://nodes.workflow.dog/basic/set-project-variable" }, basic_nodes_set_project_variable_execution),
    "https://nodes.workflow.dog/basic/switch": _.merge({ id: "https://nodes.workflow.dog/basic/switch" }, basic_nodes_switch_execution),
    "https://nodes.workflow.dog/basic/text": _.merge({ id: "https://nodes.workflow.dog/basic/text" }, basic_nodes_text_execution),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({ id: "https://nodes.workflow.dog/basic/trigger-input" }, basic_nodes_trigger_input_execution),
    "https://nodes.workflow.dog/basic/trigger-webhook": _.merge({ id: "https://nodes.workflow.dog/basic/trigger-webhook" }, basic_nodes_trigger_webhook_execution),
    "https://nodes.workflow.dog/basic/xor": _.merge({ id: "https://nodes.workflow.dog/basic/xor" }, basic_nodes_xor_execution),
    "https://nodes.workflow.dog/closecrm/get-contact-by-id": _.merge({ id: "https://nodes.workflow.dog/closecrm/get-contact-by-id" }, closecrm_nodes_get_contact_by_id_execution),
    "https://nodes.workflow.dog/closecrm/get-contacts-for-lead": _.merge({ id: "https://nodes.workflow.dog/closecrm/get-contacts-for-lead" }, closecrm_nodes_get_contacts_for_lead_execution),
    "https://nodes.workflow.dog/closecrm/get-lead-by-id": _.merge({ id: "https://nodes.workflow.dog/closecrm/get-lead-by-id" }, closecrm_nodes_get_lead_by_id_execution),
    "https://nodes.workflow.dog/closecrm/list-contacts": _.merge({ id: "https://nodes.workflow.dog/closecrm/list-contacts" }, closecrm_nodes_list_contacts_execution),
    "https://nodes.workflow.dog/closecrm/list-emails-with-lead": _.merge({ id: "https://nodes.workflow.dog/closecrm/list-emails-with-lead" }, closecrm_nodes_list_emails_with_lead_execution),
    "https://nodes.workflow.dog/closecrm/list-leads": _.merge({ id: "https://nodes.workflow.dog/closecrm/list-leads" }, closecrm_nodes_list_leads_execution),
    "https://nodes.workflow.dog/closecrm/list-leads-in-smart-view": _.merge({ id: "https://nodes.workflow.dog/closecrm/list-leads-in-smart-view" }, closecrm_nodes_list_leads_in_smart_view_execution),
    "https://nodes.workflow.dog/closecrm/subscribe-contact-in-sequence": _.merge({ id: "https://nodes.workflow.dog/closecrm/subscribe-contact-in-sequence" }, closecrm_nodes_subscribe_contact_in_sequence_execution),
    "https://nodes.workflow.dog/google/gmail-add-labels": _.merge({ id: "https://nodes.workflow.dog/google/gmail-add-labels" }, google_nodes_gmail_add_labels_execution),
    "https://nodes.workflow.dog/google/gmail-create-draft": _.merge({ id: "https://nodes.workflow.dog/google/gmail-create-draft" }, google_nodes_gmail_create_draft_execution),
    "https://nodes.workflow.dog/google/gmail-create-draft-reply": _.merge({ id: "https://nodes.workflow.dog/google/gmail-create-draft-reply" }, google_nodes_gmail_create_draft_reply_execution),
    "https://nodes.workflow.dog/google/gmail-get-attachment": _.merge({ id: "https://nodes.workflow.dog/google/gmail-get-attachment" }, google_nodes_gmail_get_attachment_execution),
    "https://nodes.workflow.dog/google/gmail-get-message": _.merge({ id: "https://nodes.workflow.dog/google/gmail-get-message" }, google_nodes_gmail_get_message_execution),
    "https://nodes.workflow.dog/google/gmail-mark-as-read": _.merge({ id: "https://nodes.workflow.dog/google/gmail-mark-as-read" }, google_nodes_gmail_mark_as_read_execution),
    "https://nodes.workflow.dog/google/gmail-mark-as-unread": _.merge({ id: "https://nodes.workflow.dog/google/gmail-mark-as-unread" }, google_nodes_gmail_mark_as_unread_execution),
    "https://nodes.workflow.dog/google/gmail-remove-labels": _.merge({ id: "https://nodes.workflow.dog/google/gmail-remove-labels" }, google_nodes_gmail_remove_labels_execution),
    "https://nodes.workflow.dog/google/gmail-reply-to-email": _.merge({ id: "https://nodes.workflow.dog/google/gmail-reply-to-email" }, google_nodes_gmail_reply_to_email_execution),
    "https://nodes.workflow.dog/google/gmail-send-email": _.merge({ id: "https://nodes.workflow.dog/google/gmail-send-email" }, google_nodes_gmail_send_email_execution),
    "https://nodes.workflow.dog/google/gmail-trash-message": _.merge({ id: "https://nodes.workflow.dog/google/gmail-trash-message" }, google_nodes_gmail_trash_message_execution),
    "https://nodes.workflow.dog/math/absolute": _.merge({ id: "https://nodes.workflow.dog/math/absolute" }, math_nodes_absolute_execution),
    "https://nodes.workflow.dog/math/add": _.merge({ id: "https://nodes.workflow.dog/math/add" }, math_nodes_add_execution),
    "https://nodes.workflow.dog/math/ceiling": _.merge({ id: "https://nodes.workflow.dog/math/ceiling" }, math_nodes_ceiling_execution),
    "https://nodes.workflow.dog/math/cos": _.merge({ id: "https://nodes.workflow.dog/math/cos" }, math_nodes_cos_execution),
    "https://nodes.workflow.dog/math/divide": _.merge({ id: "https://nodes.workflow.dog/math/divide" }, math_nodes_divide_execution),
    "https://nodes.workflow.dog/math/e": _.merge({ id: "https://nodes.workflow.dog/math/e" }, math_nodes_e_execution),
    "https://nodes.workflow.dog/math/exponent": _.merge({ id: "https://nodes.workflow.dog/math/exponent" }, math_nodes_exponent_execution),
    "https://nodes.workflow.dog/math/floor": _.merge({ id: "https://nodes.workflow.dog/math/floor" }, math_nodes_floor_execution),
    "https://nodes.workflow.dog/math/greater-than": _.merge({ id: "https://nodes.workflow.dog/math/greater-than" }, math_nodes_greater_than_execution),
    "https://nodes.workflow.dog/math/less-than": _.merge({ id: "https://nodes.workflow.dog/math/less-than" }, math_nodes_less_than_execution),
    "https://nodes.workflow.dog/math/log": _.merge({ id: "https://nodes.workflow.dog/math/log" }, math_nodes_log_execution),
    "https://nodes.workflow.dog/math/max": _.merge({ id: "https://nodes.workflow.dog/math/max" }, math_nodes_max_execution),
    "https://nodes.workflow.dog/math/min": _.merge({ id: "https://nodes.workflow.dog/math/min" }, math_nodes_min_execution),
    "https://nodes.workflow.dog/math/multiply": _.merge({ id: "https://nodes.workflow.dog/math/multiply" }, math_nodes_multiply_execution),
    "https://nodes.workflow.dog/math/natural-log": _.merge({ id: "https://nodes.workflow.dog/math/natural-log" }, math_nodes_natural_log_execution),
    "https://nodes.workflow.dog/math/pi": _.merge({ id: "https://nodes.workflow.dog/math/pi" }, math_nodes_pi_execution),
    "https://nodes.workflow.dog/math/round": _.merge({ id: "https://nodes.workflow.dog/math/round" }, math_nodes_round_execution),
    "https://nodes.workflow.dog/math/sin": _.merge({ id: "https://nodes.workflow.dog/math/sin" }, math_nodes_sin_execution),
    "https://nodes.workflow.dog/math/square-root": _.merge({ id: "https://nodes.workflow.dog/math/square-root" }, math_nodes_square_root_execution),
    "https://nodes.workflow.dog/math/subtract": _.merge({ id: "https://nodes.workflow.dog/math/subtract" }, math_nodes_subtract_execution),
    "https://nodes.workflow.dog/math/sum": _.merge({ id: "https://nodes.workflow.dog/math/sum" }, math_nodes_sum_execution),
    "https://nodes.workflow.dog/math/tan": _.merge({ id: "https://nodes.workflow.dog/math/tan" }, math_nodes_tan_execution),
    "https://nodes.workflow.dog/openai/classify": _.merge({ id: "https://nodes.workflow.dog/openai/classify" }, openai_nodes_classify_execution),
    "https://nodes.workflow.dog/openai/generate-image": _.merge({ id: "https://nodes.workflow.dog/openai/generate-image" }, openai_nodes_generate_image_execution),
    "https://nodes.workflow.dog/openai/moderate": _.merge({ id: "https://nodes.workflow.dog/openai/moderate" }, openai_nodes_moderate_execution),
    "https://nodes.workflow.dog/openai/parse": _.merge({ id: "https://nodes.workflow.dog/openai/parse" }, openai_nodes_parse_execution),
    "https://nodes.workflow.dog/openai/prompt-chatgpt": _.merge({ id: "https://nodes.workflow.dog/openai/prompt-chatgpt" }, openai_nodes_prompt_chatgpt_execution),
    "https://nodes.workflow.dog/openai/prompt-chatgpt-vision": _.merge({ id: "https://nodes.workflow.dog/openai/prompt-chatgpt-vision" }, openai_nodes_prompt_chatgpt_vision_execution),
    "https://nodes.workflow.dog/openai/speech-to-text": _.merge({ id: "https://nodes.workflow.dog/openai/speech-to-text" }, openai_nodes_speech_to_text_execution),
    "https://nodes.workflow.dog/openai/yes-no-decision": _.merge({ id: "https://nodes.workflow.dog/openai/yes-no-decision" }, openai_nodes_yes_no_decision_execution),
    "https://nodes.workflow.dog/openai/text-to-speech": _.merge({ id: "https://nodes.workflow.dog/openai/text-to-speech" }, openai_nodes_text_to_speech_execution),
    "https://nodes.workflow.dog/text/concatenate": _.merge({ id: "https://nodes.workflow.dog/text/concatenate" }, text_nodes_concatenate_execution),
    "https://nodes.workflow.dog/text/contains": _.merge({ id: "https://nodes.workflow.dog/text/contains" }, text_nodes_contains_execution),
    "https://nodes.workflow.dog/text/convert-to-regex": _.merge({ id: "https://nodes.workflow.dog/text/convert-to-regex" }, text_nodes_convert_to_regex_execution),
    "https://nodes.workflow.dog/text/convert-to-text": _.merge({ id: "https://nodes.workflow.dog/text/convert-to-text" }, text_nodes_convert_to_text_execution),
    "https://nodes.workflow.dog/text/count-occurrences": _.merge({ id: "https://nodes.workflow.dog/text/count-occurrences" }, text_nodes_count_occurrences_execution),
    "https://nodes.workflow.dog/text/length": _.merge({ id: "https://nodes.workflow.dog/text/length" }, text_nodes_length_execution),
    "https://nodes.workflow.dog/text/lowercase": _.merge({ id: "https://nodes.workflow.dog/text/lowercase" }, text_nodes_lowercase_execution),
    "https://nodes.workflow.dog/text/regex": _.merge({ id: "https://nodes.workflow.dog/text/regex" }, text_nodes_regex_execution),
    "https://nodes.workflow.dog/text/regex-search": _.merge({ id: "https://nodes.workflow.dog/text/regex-search" }, text_nodes_regex_search_execution),
    "https://nodes.workflow.dog/text/regex-search-multiple": _.merge({ id: "https://nodes.workflow.dog/text/regex-search-multiple" }, text_nodes_regex_search_multiple_execution),
    "https://nodes.workflow.dog/text/regex-test": _.merge({ id: "https://nodes.workflow.dog/text/regex-test" }, text_nodes_regex_test_execution),
    "https://nodes.workflow.dog/text/replace": _.merge({ id: "https://nodes.workflow.dog/text/replace" }, text_nodes_replace_execution),
    "https://nodes.workflow.dog/text/slice": _.merge({ id: "https://nodes.workflow.dog/text/slice" }, text_nodes_slice_execution),
    "https://nodes.workflow.dog/text/split": _.merge({ id: "https://nodes.workflow.dog/text/split" }, text_nodes_split_execution),
    "https://nodes.workflow.dog/text/split-into-list": _.merge({ id: "https://nodes.workflow.dog/text/split-into-list" }, text_nodes_split_into_list_execution),
    "https://nodes.workflow.dog/text/template": _.merge({ id: "https://nodes.workflow.dog/text/template" }, text_nodes_template_execution),
    "https://nodes.workflow.dog/text/trim-whitespace": _.merge({ id: "https://nodes.workflow.dog/text/trim-whitespace" }, text_nodes_trim_whitespace_execution),
    "https://nodes.workflow.dog/text/uppercase": _.merge({ id: "https://nodes.workflow.dog/text/uppercase" }, text_nodes_uppercase_execution),
}

export const Definitions = createExport<MergedExecutionNodeDefinition, typeof _definitions>(_definitions)
