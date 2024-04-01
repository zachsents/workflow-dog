import _ from "lodash"

import sharedTriggersBasicSchedule from "./basic/triggers/schedule/shared"
import serverTriggersBasicSchedule from "./basic/triggers/schedule/server"
import sharedTriggersBasicManual from "./basic/triggers/manual/shared"
import serverTriggersBasicManual from "./basic/triggers/manual/server"

export const serverTriggers = {
    "https://triggers.workflow.dog/basic/schedule": _.merge({}, sharedTriggersBasicSchedule, serverTriggersBasicSchedule, { id: "https://triggers.workflow.dog/basic/schedule" }),
    "https://triggers.workflow.dog/basic/manual": _.merge({}, sharedTriggersBasicManual, serverTriggersBasicManual, { id: "https://triggers.workflow.dog/basic/manual" }),
}