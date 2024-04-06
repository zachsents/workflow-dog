import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedClientDataTypeDefinition } from "@pkg/types"
import basic_data_types_any_client from "../../basic/data-types/any/client"
import basic_data_types_array_client from "../../basic/data-types/array/client"
import basic_data_types_boolean_client from "../../basic/data-types/boolean/client"
import basic_data_types_file_client from "../../basic/data-types/file/client"
import basic_data_types_number_client from "../../basic/data-types/number/client"
import basic_data_types_object_client from "../../basic/data-types/object/client"
import basic_data_types_string_client from "../../basic/data-types/string/client"
import closecrm_data_types_lead_client from "../../closecrm/data-types/lead/client"
import openai_data_types_chat_history_client from "../../openai/data-types/chat-history/client"
import openai_data_types_moderation_categories_client from "../../openai/data-types/moderation-categories/client"


const _definitions = {
    // EXPORTS
    "https://data-types.workflow.dog/basic/any": _.merge({ id: "https://data-types.workflow.dog/basic/any" }, basic_data_types_any_client),
    "https://data-types.workflow.dog/basic/array": _.merge({ id: "https://data-types.workflow.dog/basic/array" }, basic_data_types_array_client),
    "https://data-types.workflow.dog/basic/boolean": _.merge({ id: "https://data-types.workflow.dog/basic/boolean" }, basic_data_types_boolean_client),
    "https://data-types.workflow.dog/basic/file": _.merge({ id: "https://data-types.workflow.dog/basic/file" }, basic_data_types_file_client),
    "https://data-types.workflow.dog/basic/number": _.merge({ id: "https://data-types.workflow.dog/basic/number" }, basic_data_types_number_client),
    "https://data-types.workflow.dog/basic/object": _.merge({ id: "https://data-types.workflow.dog/basic/object" }, basic_data_types_object_client),
    "https://data-types.workflow.dog/basic/string": _.merge({ id: "https://data-types.workflow.dog/basic/string" }, basic_data_types_string_client),
    "https://data-types.workflow.dog/closecrm/lead": _.merge({ id: "https://data-types.workflow.dog/closecrm/lead" }, closecrm_data_types_lead_client),
    "https://data-types.workflow.dog/openai/chat-history": _.merge({ id: "https://data-types.workflow.dog/openai/chat-history" }, openai_data_types_chat_history_client),
    "https://data-types.workflow.dog/openai/moderation-categories": _.merge({ id: "https://data-types.workflow.dog/openai/moderation-categories" }, openai_data_types_moderation_categories_client),
}

export const Definitions = createExport<MergedClientDataTypeDefinition, typeof _definitions>(_definitions)
