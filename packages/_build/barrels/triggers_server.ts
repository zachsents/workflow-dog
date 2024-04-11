import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedServerTriggerDefinition } from "@pkg/types"
import basic_triggers_manual_server from "../../basic/triggers/manual/server"
import basic_triggers_request_server from "../../basic/triggers/request/server"
import basic_triggers_schedule_server from "../../basic/triggers/schedule/server"


const _definitions = {
    // EXPORTS
    "https://triggers.workflow.dog/basic/manual": _.merge({ id: "https://triggers.workflow.dog/basic/manual" }, basic_triggers_manual_server),
    "https://triggers.workflow.dog/basic/request": _.merge({ id: "https://triggers.workflow.dog/basic/request" }, basic_triggers_request_server),
    "https://triggers.workflow.dog/basic/schedule": _.merge({ id: "https://triggers.workflow.dog/basic/schedule" }, basic_triggers_schedule_server),
}

export const Definitions = createExport<MergedServerTriggerDefinition, typeof _definitions>(_definitions)