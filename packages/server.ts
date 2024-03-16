import type { ServerDataTypeDefinition, ServerNodeDefinition, ServerServiceDefinition, ServerTriggerDefinition, SharedDataTypeDefinition, SharedNodeDefinition, SharedServiceDefinition, SharedTriggerDefinition } from "@types"
import { serverNodes } from "./_barrel-server-nodes"
import { serverTriggers } from "./_barrel-server-triggers"
import { createExport } from "./util"
import { serverServices } from "./_barrel-server-services"
import { serverDataTypes } from "./_barrel-server-data-types"


export const NodeDefinitions = createExport(serverNodes as Record<string, SharedNodeDefinition & ServerNodeDefinition<any> & { id: string }>)

export const TriggerDefinitions = createExport(serverTriggers as Record<string, SharedTriggerDefinition & ServerTriggerDefinition<any> & { id: string }>)

export const ServiceDefinitions = createExport(serverServices as {
    [K in keyof typeof serverServices]: SharedServiceDefinition & ServerServiceDefinition<typeof serverServices[K]> & { id: string }
})

export const DataTypeDefinitions = createExport(serverDataTypes as Record<string, SharedDataTypeDefinition & ServerDataTypeDefinition<any> & { id: string }>)
