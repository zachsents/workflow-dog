import _ from "lodash"

import sharedNodesBasicJsonStringify from "./basic/nodes/json-stringify/shared"
import webNodesBasicJsonStringify from "./basic/nodes/json-stringify/web"
import sharedNodesBasicSwitch from "./basic/nodes/switch/shared"
import webNodesBasicSwitch from "./basic/nodes/switch/web"
import sharedNodesBasicJsonParse from "./basic/nodes/json-parse/shared"
import webNodesBasicJsonParse from "./basic/nodes/json-parse/web"
import sharedNodesBasicComposeObject from "./basic/nodes/compose-object/shared"
import webNodesBasicComposeObject from "./basic/nodes/compose-object/web"
import sharedNodesBasicAnd from "./basic/nodes/and/shared"
import webNodesBasicAnd from "./basic/nodes/and/web"
import sharedNodesBasicDecomposeObject from "./basic/nodes/decompose-object/shared"
import webNodesBasicDecomposeObject from "./basic/nodes/decompose-object/web"
import sharedNodesBasicTriggerInput from "./basic/nodes/trigger-input/shared"
import webNodesBasicTriggerInput from "./basic/nodes/trigger-input/web"
import sharedNodesBasicNumber from "./basic/nodes/number/shared"
import webNodesBasicNumber from "./basic/nodes/number/web"
import sharedNodesBasicText from "./basic/nodes/text/shared"
import webNodesBasicText from "./basic/nodes/text/web"

export const webNodes = {
    "https://nodes.workflow.dog/basic/json-stringify": _.merge({}, sharedNodesBasicJsonStringify, webNodesBasicJsonStringify, { id: "https://nodes.workflow.dog/basic/json-stringify" }),
    "https://nodes.workflow.dog/basic/switch": _.merge({}, sharedNodesBasicSwitch, webNodesBasicSwitch, { id: "https://nodes.workflow.dog/basic/switch" }),
    "https://nodes.workflow.dog/basic/json-parse": _.merge({}, sharedNodesBasicJsonParse, webNodesBasicJsonParse, { id: "https://nodes.workflow.dog/basic/json-parse" }),
    "https://nodes.workflow.dog/basic/compose-object": _.merge({}, sharedNodesBasicComposeObject, webNodesBasicComposeObject, { id: "https://nodes.workflow.dog/basic/compose-object" }),
    "https://nodes.workflow.dog/basic/and": _.merge({}, sharedNodesBasicAnd, webNodesBasicAnd, { id: "https://nodes.workflow.dog/basic/and" }),
    "https://nodes.workflow.dog/basic/decompose-object": _.merge({}, sharedNodesBasicDecomposeObject, webNodesBasicDecomposeObject, { id: "https://nodes.workflow.dog/basic/decompose-object" }),
    "https://nodes.workflow.dog/basic/trigger-input": _.merge({}, sharedNodesBasicTriggerInput, webNodesBasicTriggerInput, { id: "https://nodes.workflow.dog/basic/trigger-input" }),
    "https://nodes.workflow.dog/basic/number": _.merge({}, sharedNodesBasicNumber, webNodesBasicNumber, { id: "https://nodes.workflow.dog/basic/number" }),
    "https://nodes.workflow.dog/basic/text": _.merge({}, sharedNodesBasicText, webNodesBasicText, { id: "https://nodes.workflow.dog/basic/text" }),
}