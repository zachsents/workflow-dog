import type { EventSources } from "core/db"
import type { Selectable } from "kysely"
import type { Request } from "express"

export interface ServerDefinition {
    id: string
    name: string
}


export interface ServerNodeDefinition extends ServerDefinition {
    action: (inputs: Record<string, unknown>, context: {
        node: any
        workflowId: string
        projectId: string
        eventPayload: any
    }) => MaybePromise<Record<string, any> | void>
}


type EventSourceInitializer = {
    /** Also doubles as URL slug */
    id: string
    definitionId: string
    state?: any
}

export interface ServerEventType extends ServerDefinition {
    /**
     * Generates event sources from some arbitrary data, usually passed
     * from a trigger config form. Multiple event sources can be created
     * from the same data.
     * 
     * Event Source IDs should be absolutely unique and should also be
     * deterministic based on the identifying data. Event Sources are
     * smartly reused and deduped. Hashing functions are good candidates
     * for generating IDs.
     */
    createEventSources: (options: {
        workflowId: string
        projectId: string
        data?: unknown
    }) => MaybePromise<EventSourceInitializer[]>

    /**
     * Generates run data from an event. Multiple runs can be spawned from a
     * single event. If no runs are generated, you can return `undefined`.
     */
    generateRunsFromEvent: (event: ServerEvent, workflowTriggerConfig?: any) => MaybePromise<any[] | void>
}

export interface ServerEventSourceDefinition extends ServerDefinition {
    setup?: (options: {
        initializer: EventSourceInitializer
        enabledEventTypes: string[]
    }) => MaybePromise<{ state?: any } | void>
    addEventTypes?: (source: Selectable<EventSources>, eventTypeIds: string[]) => MaybePromise<{ state?: any } | void>
    removeEventTypes?: (source: Selectable<EventSources>, eventTypeIds: string[]) => MaybePromise<{ state?: any } | void>
    cleanup?: (source: Selectable<EventSources>) => MaybePromise<void>
    generateEvents: (req: Request, source: Selectable<EventSources>) => MaybePromise<{
        events?: Omit<ServerEvent, "source">[]
        state?: any
    } | void>
}

export interface ServerEvent {
    source: string
    type: string
    data: any
}


type MaybePromise<T> = T | Promise<T>