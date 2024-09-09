import type { EventSources } from "core/db"
import type { Selectable } from "kysely"
import type { ServerEventSourceDefinition, ServerEventType, ServerNodeDefinition, ServerValueTypeDefinition } from "../lib/types"
import { createRegistryFn, EVENT_SOURCE_ID_PREFIX, EVENT_TYPE_ID_PREFIX, NODE_ID_PREFIX, VALUE_TYPE_ID_PREFIX } from "../lib/utils"
import { SERVER_EVENT_SOURCE_DEFAULTS, SERVER_EVENT_TYPE_DEFAULTS, SERVER_NODE_DEFAULTS, SERVER_VALUE_TYPE_DEFAULTS } from "./defaults.server"


export const nodes: Record<string, ServerNodeDefinition> = {}
export const eventTypes: Record<string, ServerEventType> = {}
export const eventSources: Record<string, ServerEventSourceDefinition> = {}
export const valueTypes: Record<string, ServerValueTypeDefinition> = {}


export function createPackage(packageName: string) {
    return {
        node: createRegistryFn(nodes, {
            idPrefix: NODE_ID_PREFIX,
            defaults: SERVER_NODE_DEFAULTS,
            packageName,
        }),
        eventType: createRegistryFn(eventTypes, {
            idPrefix: EVENT_TYPE_ID_PREFIX,
            defaults: SERVER_EVENT_TYPE_DEFAULTS,
            packageName,
        }),
        eventSource: createRegistryFn(eventSources, {
            idPrefix: EVENT_SOURCE_ID_PREFIX,
            defaults: SERVER_EVENT_SOURCE_DEFAULTS,
            packageName,
        }),
        valueType: createRegistryFn(valueTypes, {
            idPrefix: VALUE_TYPE_ID_PREFIX,
            defaults: SERVER_VALUE_TYPE_DEFAULTS,
            packageName,
        }),
    }
}

export function uniformEventData(source: Selectable<EventSources>, data: any) {
    return source.enabled_event_types.map(type => ({ type, data }))
}
