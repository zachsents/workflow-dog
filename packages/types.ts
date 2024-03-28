import type { ComponentType } from "react"
import type { Node, Workflow, WorkflowRunState } from "shared/types.js"
import { ZodSchema, z } from "zod"
import type { serverDataTypes } from "./_barrel-server-data-types"
import type { serverTriggers } from "./_barrel-server-triggers"


/* -------------------------------------------------------------------------- */
/*                                    Nodes                                   */
/* -------------------------------------------------------------------------- */

export type SharedNodeDefinition = {
    name: string
    description: string
    inputs: Record<string, SharedNodeDefinitionInterface>
    outputs: Record<string, SharedNodeDefinitionInterface>
}

export interface SharedNodeDefinitionInterface {
    name: string
    type: keyof DataTypeMap
    group?: boolean
    named?: boolean

    // TODO: implement these
    groupMin?: number
    groupMax?: number
}

export type ServerNodeDefinition<T extends SharedNodeDefinition> = {
    action: (inputs: {
        [K in keyof T["inputs"]]: InterfaceValue<T, "inputs", K>
    }, info: {
        node: Node
        triggerData: Record<string, any>
        runState: WorkflowRunState
        token?: string
    }) => {
            [K in keyof T["outputs"]]: InterfaceValue<T, "outputs", K>
        }
}

type InterfaceValue<
    T extends SharedNodeDefinition,
    IK extends "inputs" | "outputs",
    K extends keyof T[IK]
> = T[IK][K] extends SharedNodeDefinitionInterface
    ? T[IK][K]["group"] extends true
    ? T[IK][K]["named"] extends true
    ? Record<string, DataTypeByURI<T[IK][K]["type"]>>
    : DataTypeByURI<T[IK][K]["type"]>[]
    : DataTypeByURI<T[IK][K]["type"]>
    : never



type DataTypeMap = {
    [K in keyof typeof serverDataTypes]: z.infer<typeof serverDataTypes[K]["schema"]>
}
type DataTypeByURI<URI extends keyof DataTypeMap> = DataTypeMap[URI]


export type WebNodeDefinition<T extends SharedNodeDefinition> = {
    icon: JSX.ElementType
    color: string
    tags: string[]
    inputs: {
        [K in keyof T["inputs"]]: WebNodeDefinitionInterface
    }
    outputs: {
        [K in keyof T["outputs"]]: WebNodeDefinitionOutput
    }
    renderNode?: ComponentType<{ id: string }>
    renderBody?: ComponentType<{ id: string }>
}

export interface WebNodeDefinitionInterface {
    description?: string
    bullet?: boolean
    recommendedNode?: {
        definition: string
        handle: string
        data?: Record<string, any>
    }
}

export interface WebNodeDefinitionOutput extends WebNodeDefinitionInterface {
    selectable?: boolean
}


/* -------------------------------------------------------------------------- */
/*                                  Triggers                                  */
/* -------------------------------------------------------------------------- */

export type SharedTriggerDefinition = {
    name: string
    whenName: string
    description: string
    inputs: Record<string, SharedTriggerDefinitionInterface>
    outputs: Record<string, SharedTriggerDefinitionInterface>
}

export interface SharedTriggerDefinitionInterface {
    name: string
    type: keyof DataTypeMap
}

export type WorkflowTrigger = {
    type: keyof typeof serverTriggers
    config: Record<string, any>
}

export type ServerTriggerDefinition<T extends SharedTriggerDefinition> = {
    /** Called when this trigger is modified, created, or removed */
    onChange?: (oldTrigger: WorkflowTrigger | null, newTrigger: WorkflowTrigger | null, workflowId: string) => Promise<void>
}

export type WebTriggerDefinition<T extends SharedTriggerDefinition> = {
    icon: ComponentType
    color: string
    tags: string[]
    renderConfig?: ComponentType<{ workflowId: string, workflow: Workflow }>
}


/* -------------------------------------------------------------------------- */
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */



export type ServiceAuthAcquisitionMethod = "oauth2" | "key" | "user-pass"


export type SharedServiceDefinition = {
    name: string
    authAcquisition: {
        method: ServiceAuthAcquisitionMethod
    }
}

export interface OAuth2Config {
    authUrl: string
    tokenUrl: string
    scopeDelimiter: string
    additionalParams: Record<string, string>
    allowAdditionalParams: string[]
    state?: boolean | number | "request" | string
    scopes: string[]
    allowAdditionalScopes: boolean
    profileUrl: string
    getDisplayName: (profile: any, token: any) => string
    getServiceUserId: (profile: any, token: any) => string
    includeRedirectUriInTokenRequest: boolean
}

export interface KeyConfig {
    profileUrl: string
    getDisplayName: (profile: any, token: any) => string
}

export interface UserPassConfig {
    profileUrl: string
    getDisplayName: (profile: any) => string
}

export type ServerServiceDefinition<T extends SharedServiceDefinition> = {
    authAcquisition: T["authAcquisition"]["method"] extends "oauth2"
    ? OAuth2Config
    : T["authAcquisition"]["method"] extends "key"
    ? KeyConfig
    : T["authAcquisition"]["method"] extends "user-pass"
    ? UserPassConfig : {}

    authUsage: {
        method: "bearer"
    } | {
        method: "basic"
    }
}

export type WebServiceDefinition<T extends SharedServiceDefinition> = {
    icon: ComponentType
    color: string
    transformScope: (scope: string) => string
}


/* -------------------------------------------------------------------------- */
/*                                 Data Types                                 */
/* -------------------------------------------------------------------------- */

export type SharedDataTypeDefinition = {
    name: string
    description: string
    schema: ZodSchema
}

export type ServerDataTypeDefinition<T extends SharedDataTypeDefinition> = {

}

export type WebDataTypeDefinition<T extends SharedDataTypeDefinition> = {
    icon: ComponentType
}