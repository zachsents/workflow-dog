import type { EventSources } from "core/db"
import type { Selectable } from "kysely"

export interface ServerDefinition {
    id: string
    name: string
}


type EventSourceInitializer = {
    /** Also doubles as URL slug */
    id: string
    definitionId: string
    state?: any
}

export interface ServerEventType extends ServerDefinition {
    createEventSources: (options: {
        workflowId: string
        data?: unknown
    }) => Promise<EventSourceInitializer[]> | EventSourceInitializer[]
}


export interface ServerEventSourceDefinition extends ServerDefinition {
    setup: (options: {
        initializer: EventSourceInitializer
        enabledEventTypes: string[]
    }) => Promise<{ state?: any } | void>
    addEventTypes: (source: Selectable<EventSources>, eventTypeIds: string[]) => Promise<{ state?: any } | void>
    removeEventTypes: (source: Selectable<EventSources>, eventTypeIds: string[]) => Promise<{ state?: any } | void>
    cleanup: (source: Selectable<EventSources>) => Promise<void>
}