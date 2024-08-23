import type React from "react"
import type { ValueTypeUsage } from "workflow-types/react"
import type { EventSourceCreation } from "./shared"

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
    eventSourceCreation: EventSourceCreation
    sourceComponent?: React.ComponentType
}

export interface ClientEventTypeIO {
    displayName?: string
    valueType: ValueTypeUsage | null
    description?: string
}
