import type { ComponentType } from "react"
import type { IconType } from "react-icons/lib/iconBase"
import type { Node, Workflow, WorkflowRunState } from "shared/types"
import { ZodSchema, z } from "zod"


/* -------------------------------------------------------------------------- */
/*                                    Nodes                                   */
/* -------------------------------------------------------------------------- */

export type SharedNodeDefinition = {
    name: string
    description: string
    inputs: Record<string, SharedNodeDefinitionInterface>
    outputs: Record<string, SharedNodeDefinitionInterface>

    requiredService?: NodeServiceRequirement

    /** 
     * Marked as WIP for now
     * 
     * Each entry in the outer array represents a requirement. If an array is
     * provided as a requirement, the entries in the inner array are OR'd together.
     */
    WIP_requiredServices?: (NodeServiceRequirement | NodeServiceRequirement[])[]
}

export interface SharedNodeDefinitionInterface {
    name: string
    // type: keyof DataTypeMap
    type: string
    group?: boolean
    named?: boolean

    // TODO: implement these
    groupMin?: number
    groupMax?: number
}

export type ExecutionNodeDefinition<T extends SharedNodeDefinition> = {
    action: (inputs: {
        // [K in keyof T["inputs"]]: InterfaceValue<T, "inputs", K>
        [K in keyof T["inputs"]]: any
    }, info: {
        node: Node
        triggerData: Record<string, any>
        runState: WorkflowRunState
        token?: string
    }) => {
            // [K in keyof T["outputs"]]: InterfaceValue<T, "outputs", K>
            [K in keyof T["outputs"]]: any
        }
}

// type InterfaceValue<
//     T extends SharedNodeDefinition,
//     IK extends "inputs" | "outputs",
//     K extends keyof T[IK]
// > = T[IK][K] extends SharedNodeDefinitionInterface
//     ? T[IK][K]["group"] extends true
//     ? T[IK][K]["named"] extends true
//     ? Record<string, DataTypeByURI<T[IK][K]["type"]>>
//     : DataTypeByURI<T[IK][K]["type"]>[]
//     : DataTypeByURI<T[IK][K]["type"]>
//     : never



// type DataTypeMap = {
//     // [K in keyof typeof serverDataTypes]: z.infer<typeof serverDataTypes[K]["schema"]>
//     // forget about this for now
// }
// type DataTypeByURI<URI extends keyof DataTypeMap> = DataTypeMap[URI]


export type WebNodeDefinition<T extends SharedNodeDefinition> = {
    icon: IconType | ComponentType
    color: string
    tags: string[]
    inputs: {
        [K in keyof T["inputs"]]: WebNodeDefinitionInterface
    }
    outputs: {
        [K in keyof T["outputs"]]: WebNodeDefinitionOutput
    }

    /** @deprecated Not implemented in new version */
    renderNode?: ComponentType<{ id: string }>

    renderBody?: ComponentType<{ id: string }>
}

export type NodeServiceRequirement = {
    id: string
    scopes?: (string | string[])[]
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
    description?: string
    // type: keyof DataTypeMap
    type: string
}

export type WorkflowTrigger = {
    type: string
    config: Record<string, any>
}

export type ServerTriggerDefinition<T extends SharedTriggerDefinition> = {
    /** Called when this trigger is modified, created, or removed */
    onChange?: (oldTrigger: WorkflowTrigger | null, newTrigger: WorkflowTrigger | null, workflowId: string) => Promise<void>
}

export type WebTriggerDefinition<T extends SharedTriggerDefinition> = {
    icon: IconType | ComponentType
    color: string
    tags: string[]
    renderConfig?: ComponentType<{
        workflowId: string
        workflow: Workflow
        updateConfig: (config: Record<string, any>) => Promise<void>
        isUpdating: boolean
        onClose: () => void
    }>
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
    getDisplayName?: (profile: any, token: any) => string
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
    icon: IconType | ComponentType
    color: string
    transformScope?: (scope: string) => string
    generateKeyUrl?: string
}


/* -------------------------------------------------------------------------- */
/*                                 Data Types                                 */
/* -------------------------------------------------------------------------- */

export type SharedDataTypeDefinition = {
    name: string
    description: string
    schema: ZodSchema
}

export type WebDataTypeDefinition<T extends SharedDataTypeDefinition> = {
    icon: IconType | ComponentType
    manualInputComponent: ComponentType<DataTypeManualInputProps<T["schema"]>>
    renderPreview: ComponentType<{ value: z.infer<T["schema"]> }>
    shouldExpand?: (value: z.infer<T["schema"]>) => boolean
    renderExpanded?: ComponentType<{ value: z.infer<T["schema"]> }>
}

export interface DataTypeManualInputProps<T extends ZodSchema> {
    value: z.infer<T>
    onChange: (value: z.infer<T>) => void
    [key: string]: any
}