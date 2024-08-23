import type { EventSources } from "core/db"
import type { Selectable } from "kysely"
import type { Request } from "express"

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
    }) => MaybePromise<EventSourceInitializer[]>
    generateRunsFromEvent: (event: ServerEvent, workflowTriggerConfig?: any) => MaybePromise<any[] | void>
}

export interface ServerEventSourceDefinition extends ServerDefinition {
    setup: (options: {
        initializer: EventSourceInitializer
        enabledEventTypes: string[]
    }) => MaybePromise<{ state?: any } | void>
    addEventTypes: (source: Selectable<EventSources>, eventTypeIds: string[]) => MaybePromise<{ state?: any } | void>
    removeEventTypes: (source: Selectable<EventSources>, eventTypeIds: string[]) => MaybePromise<{ state?: any } | void>
    cleanup: (source: Selectable<EventSources>) => MaybePromise<void>
    generateEvents: (req: Request, source: Selectable<EventSources>) => MaybePromise<{
        events: Omit<ServerEvent, "source">[]
        state?: any
    }>
}

export interface ServerEvent {
    source: string
    type: string
    data: any
}


type MaybePromise<T> = T | Promise<T>