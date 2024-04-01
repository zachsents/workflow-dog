import _ from "lodash"

import sharedNodesBasicJsonStringify from "./basic/nodes/json-stringify/shared"
import serverNodesBasicJsonStringify from "./basic/nodes/json-stringify/server"
import sharedNodesBasicSwitch from "./basic/nodes/switch/shared"
import serverNodesBasicSwitch from "./basic/nodes/switch/server"
import sharedNodesBasicJsonParse from "./basic/nodes/json-parse/shared"
import serverNodesBasicJsonParse from "./basic/nodes/json-parse/server"
import sharedNodesBasicComposeObject from "./basic/nodes/compose-object/shared"
import serverNodesBasicComposeObject from "./basic/nodes/compose-object/server"
import sharedNodesBasicAnd from "./basic/nodes/and/shared"
import serverNodesBasicAnd from "./basic/nodes/and/server"
import sharedNodesBasicDecomposeObject from "./basic/nodes/decompose-object/shared"
import serverNodesBasicDecomposeObject from "./basic/nodes/decompose-object/server"
import sharedNodesBasicTriggerInput from "./basic/nodes/trigger-input/shared"
import serverNodesBasicTriggerInput from "./basic/nodes/trigger-input/server"
import sharedNodesBasicNumber from "./basic/nodes/number/shared"
import serverNodesBasicNumber from "./basic/nodes/number/server"
import sharedNodesBasicText from "./basic/nodes/text/shared"
import serverNodesBasicText from "./basic/nodes/text/server"

export const serverNodes = {
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({}, sharedNodesBasicJsonStringify, serverNodesBasicJsonStringify, { id: "https://nodes.workflow.dog/basic/json-stringify" }),
    "https://nodes.workflow.dog/basic/switch": _.merge({}, sharedNodesBasicSwitch, serverNodesBasicSwitch, { id: "https://nodes.workflow.dog/basic/switch" }),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({}, sharedNodesBasicJsonParse, serverNodesBasicJsonParse, { id: "https://nodes.workflow.dog/basic/json-parse" }),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({}, sharedNodesBasicComposeObject, serverNodesBasicComposeObject, { id: "https://nodes.workflow.dog/basic/compose-object" }),
    "https://nodes.workflow.dog/basic/and": _.merge({}, sharedNodesBasicAnd, serverNodesBasicAnd, { id: "https://nodes.workflow.dog/basic/and" }),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({}, sharedNodesBasicDecomposeObject, serverNodesBasicDecomposeObject, { id: "https://nodes.workflow.dog/basic/decompose-object" }),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({}, sharedNodesBasicTriggerInput, serverNodesBasicTriggerInput, { id: "https://nodes.workflow.dog/basic/trigger-input" }),
    "https://nodes.workflow.dog/basic/number": _.merge({}, sharedNodesBasicNumber, serverNodesBasicNumber, { id: "https://nodes.workflow.dog/basic/number" }),
    "https://nodes.workflow.dog/basic/text": _.merge({}, sharedNodesBasicText, serverNodesBasicText, { id: "https://nodes.workflow.dog/basic/text" }),
}