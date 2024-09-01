import type { Selectable } from "kysely"
import type { ServerDefinition, ServerEventSourceDefinition, ServerEventType } from "./types/server"
import { createRegistryBuilderFn } from "./utils"
import type { EventSources } from "core/db"


export const eventTypes: Record<string, ServerEventType> = {}
export const eventSources: Record<string, ServerEventSourceDefinition> = {}


const GLOBAL_DEFAULTS = {
} satisfies Partial<ServerDefinition>


export function createPackageHelper(packageName: string) {
    return {
        registerEventType: createRegistryBuilderFn(eventTypes, `eventType:${packageName}`, {
            ...GLOBAL_DEFAULTS,
        }),
        registerEventSource: createRegistryBuilderFn(eventSources, `eventSource:${packageName}`, {
            ...GLOBAL_DEFAULTS,
        }),
    }
}


export function uniformEventData(source: Selectable<EventSources>, data: any) {
    return source.enabled_event_types.map(type => ({ type, data }))
}
