import type { ClientNodeDefinition, ClientServiceDefinition, ClientTriggerDefinition, ClientTypeMetaDefinition } from "@pkg/types/client"
import _ from "lodash"
import type { sharedNode, sharedService, sharedTrigger, sharedTypeMeta } from "./shared"

export function clientNode<Shared extends ReturnType<typeof sharedNode>>(
    sharedDef: Shared,
    def: ClientNodeDefinition<Shared>,
) {
    return _.merge({}, sharedDef, def)
}

export function clientTrigger<Shared extends ReturnType<typeof sharedTrigger>>(
    sharedDef: Shared,
    def: ClientTriggerDefinition,
) {
    return _.merge({}, sharedDef, def)
}

export function clientService<Shared extends ReturnType<typeof sharedService>>(
    sharedDef: Shared,
    def: ClientServiceDefinition<Shared>,
) {
    return _.merge({}, sharedDef, def)
}

export function clientTypeMeta<Shared extends ReturnType<typeof sharedTypeMeta>>(
    sharedDef: Shared,
    def: ClientTypeMetaDefinition<Shared>,
) {
    return _.merge({}, sharedDef, def)
}