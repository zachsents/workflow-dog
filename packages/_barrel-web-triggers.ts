import _ from "lodash"

import sharedTriggersBasicSchedule from "./basic/triggers/schedule/shared"
import webTriggersBasicSchedule from "./basic/triggers/schedule/web"
import sharedTriggersBasicManual from "./basic/triggers/manual/shared"
import webTriggersBasicManual from "./basic/triggers/manual/web"

export const webTriggers = {
    "https://triggers.workflow.dog/basic/schedule": _.merge({}, sharedTriggersBasicSchedule, webTriggersBasicSchedule, { id: "https://triggers.workflow.dog/basic/schedule" }),
    "https://triggers.workflow.dog/basic/manual": _.merge({}, sharedTriggersBasicManual, webTriggersBasicManual, { id: "https://triggers.workflow.dog/basic/manual" }),
}