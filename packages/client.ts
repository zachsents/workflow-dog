import { IdNamespace } from "shared/utils"
import * as nodeDefs from "./build/barrels/nodes.client"
import * as serviceDefs from "./build/barrels/services.client"
import * as triggerDefs from "./build/barrels/triggers.client"
import * as typeMetaDefs from "./build/barrels/type-meta.client"
import { Registry } from "./build/utils"
import type { ClientNodeExport, ClientServiceExport, ClientTriggerExport, ClientTypeMetaExport } from "./types/client"


export const NodeDefinitions = new Registry<ClientNodeExport>(
    IdNamespace.ActionNodeDefinition,
    nodeDefs
)

export const TriggerDefinitions = new Registry<ClientTriggerExport>(
    IdNamespace.TriggerDefinition,
    triggerDefs
)

export const ServiceDefinitions = new Registry<ClientServiceExport>(
    IdNamespace.Service,
    serviceDefs
)

export const TypeMetaDefinitions = new Registry<ClientTypeMetaExport>(
    IdNamespace.TypeMeta,
    typeMetaDefs
)
