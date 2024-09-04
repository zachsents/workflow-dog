import type { ApiRouterOutput } from "api/trpc/router"
import type { ValueTypeUsage } from "workflow-types/react"

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

export interface ClientNodeDefinition extends ClientDefinition {
    component: React.ComponentType
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
