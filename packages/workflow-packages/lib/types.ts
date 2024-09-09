import type { ApiRouterOutput } from "api/trpc/router"
import type { EventSources } from "core/db"
import type { Request } from "express"
import type { Selectable } from "kysely"


export type MaybePromise<T> = T | Promise<T>
export type Common<A, B> = {
    [K in keyof A & keyof B]: A[K]
}


export interface ClientDefinition {
    id: string
    name: string
    description: string
    icon: React.ComponentType
    /**
     * If this starts with a #, it will be treated as a hex code. Otherwise, 
     * it will be treated as a Tailwind class.
     */
    color: string
    keywords?: string[]
}

export interface ServerDefinition {
    id: string
    name: string
}


export interface ClientNodeDefinition extends ClientDefinition {
    component: React.ComponentType
}

export interface ServerNodeDefinition extends ServerDefinition {
    action: (inputs: Record<string, unknown>, context: {
        node: any
        workflowId: string
        projectId: string
        eventPayload: any
    }) => MaybePromise<Record<string, any> | void>
}


export interface ClientValueTypeDefinition extends ClientDefinition {
    genericParams: number
    specificName?: (...genericParams: ValueTypeUsage[]) => string
    previewComponent: React.ComponentType<{ value: any }>
    fullComponent: React.ComponentType<{ value: any }>
}

export type ValueTypeUsage = {
    typeDefinitionId: string
    genericParams: ValueTypeUsage[]
}

export interface ServerValueTypeDefinition extends ServerDefinition {
    isApplicable?: (value: unknown) => boolean
    toJSON?: (value: unknown, toJSON: (value: unknown) => any) => any
    conversionPriority?: number
    parseEncodedValue: (value: unknown) => any
}


export interface ClientEventType extends ClientDefinition {
    whenName: string
    workflowInputs: Record<string, ClientEventTypeIO>
    workflowOutputs: Record<string, ClientEventTypeIO>
    requiresConfiguration?: boolean
    sourceComponent?: React.ComponentType<ClientEventTypeSourceComponentProps>
    additionalDropdownItems?: React.ComponentType<{ workflowId: string }>
}

export type ClientEventTypeSourceComponentProps = {
    workflowId: string
    eventSources: ApiRouterOutput["workflows"]["byId"]["eventSources"]
}

export interface ClientEventTypeIO {
    displayName?: string
    valueType: ValueTypeUsage
    description?: string
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

export type EventSourceInitializer = {
    /** Also doubles as URL slug */
    id: string
    definitionId: string
    state?: any
}

export interface ServerEvent {
    source: string
    type: string
    data: any
}
