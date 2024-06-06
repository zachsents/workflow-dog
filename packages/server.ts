import { IdNamespace } from "shared/utils"
import { Registry } from "./build/utils"
import * as triggerDefs from "./build/barrels/triggers.server"
import * as serviceDefs from "./build/barrels/services.server"
import type { ServerServiceExport, ServerTriggerExport } from "./types/server"


export const TriggerDefinitions = new Registry<ServerTriggerExport>(
    IdNamespace.TriggerDefinition,
    triggerDefs
)

export const ServiceDefinitions = new Registry<ServerServiceExport>(
    IdNamespace.Service,
    serviceDefs
)
