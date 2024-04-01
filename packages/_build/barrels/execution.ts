import _ from "lodash"
import { createExport } from "../util"

import basic_nodes_trigger_input_shared from "../../basic/nodes/trigger-input/shared"
import basic_nodes_trigger_input_execution from "../../basic/nodes/trigger-input/execution"
import basic_nodes_text_shared from "../../basic/nodes/text/shared"
import basic_nodes_text_execution from "../../basic/nodes/text/execution"
import basic_nodes_switch_shared from "../../basic/nodes/switch/shared"
import basic_nodes_switch_execution from "../../basic/nodes/switch/execution"
import basic_nodes_number_shared from "../../basic/nodes/number/shared"
import basic_nodes_number_execution from "../../basic/nodes/number/execution"
import basic_nodes_json_stringify_shared from "../../basic/nodes/json-stringify/shared"
import basic_nodes_json_stringify_execution from "../../basic/nodes/json-stringify/execution"
import basic_nodes_json_parse_shared from "../../basic/nodes/json-parse/shared"
import basic_nodes_json_parse_execution from "../../basic/nodes/json-parse/execution"
import basic_nodes_decompose_object_shared from "../../basic/nodes/decompose-object/shared"
import basic_nodes_decompose_object_execution from "../../basic/nodes/decompose-object/execution"
import basic_nodes_compose_object_shared from "../../basic/nodes/compose-object/shared"
import basic_nodes_compose_object_execution from "../../basic/nodes/compose-object/execution"
import basic_nodes_and_shared from "../../basic/nodes/and/shared"
import basic_nodes_and_execution from "../../basic/nodes/and/execution"



import type { SharedNodeDefinition, ExecutionNodeDefinition } from "@types"

export const NodeDefinitions = createExport({
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
    "https://nodes.workflow.dog/basic/switch": _.merge({},
        basic_nodes_switch_shared,
        basic_nodes_switch_execution,
        { id: "https://nodes.workflow.dog/basic/switch" }
    ),
    "https://nodes.workflow.dog/basic/number": _.merge({},
        basic_nodes_number_shared,
        basic_nodes_number_execution,
        { id: "https://nodes.workflow.dog/basic/number" }
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