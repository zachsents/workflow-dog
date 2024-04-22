import _ from "lodash"
import { createExport } from "@pkg/_build/util"
// IMPORTS
import type { MergedClientTriggerDefinition } from "@pkg/types"
import google_triggers_gmail_email_received_client from "../../google/triggers/gmail-email-received/client"
import basic_triggers_manual_client from "../../basic/triggers/manual/client"
import basic_triggers_request_client from "../../basic/triggers/request/client"
import basic_triggers_schedule_client from "../../basic/triggers/schedule/client"


const _definitions = {
    // EXPORTS
    "https://triggers.workflow.dog/google/gmail-email-received": _.merge({ id: "https://triggers.workflow.dog/google/gmail-email-received" }, google_triggers_gmail_email_received_client),
    "https://triggers.workflow.dog/basic/manual": _.merge({ id: "https://triggers.workflow.dog/basic/manual" }, basic_triggers_manual_client),
    "https://triggers.workflow.dog/basic/request": _.merge({ id: "https://triggers.workflow.dog/basic/request" }, basic_triggers_request_client),
    "https://triggers.workflow.dog/basic/schedule": _.merge({ id: "https://triggers.workflow.dog/basic/schedule" }, basic_triggers_schedule_client),
}

export const Definitions = createExport<MergedClientTriggerDefinition, typeof _definitions>(_definitions)
