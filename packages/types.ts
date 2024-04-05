import _ from "lodash"
import type { ComponentType } from "react"
import type { IconType } from "react-icons/lib/iconBase"
import type { Node, Workflow, WorkflowRunState } from "shared/types"
import { ZodSchema, z } from "zod"
import type { DataTypeDefinitions } from "./client"



/* ----------------------------- Meta Types ---------------------------- */

export type DataTypeId = keyof typeof DataTypeDefinitions["asObject"]

export type BaseInterfaceValue<T extends SharedNodeDefinition, IK extends "inputs" | "outputs", K extends keyof T[IK]> = z.infer<typeof DataTypeDefinitions["asObject"][T[IK][K]["type"]]["schema"]>

export type InterfaceValue<T extends SharedNodeDefinition, IK extends "inputs" | "outputs", K extends keyof T[IK]> =
    T[IK][K]["group"] extends true
    ? T[IK][K]["named"] extends true
    ? Record<string, BaseInterfaceValue<T, IK, K>>
    : BaseInterfaceValue<T, IK, K>[]
    : BaseInterfaceValue<T, IK, K>


/* -------------------------------------------------------------------------- */
/*                                    Nodes                                   */
/* -------------------------------------------------------------------------- */


export interface SharedNodeDefinitionInterface {
    name: string
    type: DataTypeId
    group?: boolean
    named?: boolean

    // TODO: implement these
    groupMin?: number
    groupMax?: number
}

export type NodeServiceRequirement = {
    id: string
    scopes?: (string | string[])[]
}

export interface SharedNodeDefinition<I extends Record<string, SharedNodeDefinitionInterface> = Record<string, SharedNodeDefinitionInterface>, O extends Record<string, SharedNodeDefinitionInterface> = Record<string, SharedNodeDefinitionInterface>> {
    name: string
    description: string
    inputs: I
    outputs: O

    requiredService?: NodeServiceRequirement

    /** 
     * Marked as WIP for now
     * 
     * Each entry in the outer array represents a requirement. If an array is
     * provided as a requirement, the entries in the inner array are OR'd together.
     */
    WIP_requiredServices?: (NodeServiceRequirement | NodeServiceRequirement[])[]
}

export interface ExecutionNodeDefinition<T extends SharedNodeDefinition> {
    action: (inputs: {
        [K in keyof T["inputs"]]: InterfaceValue<T, "inputs", K>
    }, info: {
        node: Node
        triggerData: Record<string, any>
        runState: WorkflowRunState
        token?: { access_token?: string, key?: string }
    }) => {
        [K in keyof T["outputs"]]: InterfaceValue<T, "outputs", K>
    } | Promise<{
        [K in keyof T["outputs"]]: InterfaceValue<T, "outputs", K>
    }>
}

export interface ClientNodeDefinitionInterface {
    description?: string
    bullet?: boolean
    recommendedNode?: {
        definition: string
        handle: string
        data?: Record<string, any>
    }
}

export interface ClientNodeDefinitionOutput extends ClientNodeDefinitionInterface {
    selectable?: boolean
}

export type ClientNodeDefinition<T extends SharedNodeDefinition> = {
    icon: IconType | ComponentType
    color: string
    tags: string[]
    inputs: {
        [K in keyof T["inputs"]]: ClientNodeDefinitionInterface
    }
    outputs: {
        [K in keyof T["outputs"]]: ClientNodeDefinitionOutput
    }

    /** @deprecated Not implemented in new version */
    renderNode?: ComponentType<{ id: string }>

    renderBody?: ComponentType<{ id: string }>
}

export function createSharedNodeDefinition<T extends SharedNodeDefinition>(def: T): SharedNodeDefinition<T["inputs"], T["outputs"]> {
    return def
}

export function createExecutionNodeDefinition<T extends SharedNodeDefinition>(sharedDef: T, def: ExecutionNodeDefinition<T>) {
    return _.merge({}, sharedDef, def)
}

export function createClientNodeDefinition<T extends SharedNodeDefinition>(sharedDef: T, def: ClientNodeDefinition<T>) {
    return _.merge({}, sharedDef, def)
}

export type MergedExecutionNodeDefinition = SharedNodeDefinition & ExecutionNodeDefinition<SharedNodeDefinition> & { id: string }
export type MergedClientNodeDefinition = SharedNodeDefinition & ClientNodeDefinition<SharedNodeDefinition> & { id: string }


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
    type: DataTypeId
}

export type WorkflowTrigger = {
    type: string
    config: Record<string, any>
}

export type ServerTriggerDefinition = {
    /** Called when this trigger is modified, created, or removed */
    onChange?: (oldTrigger: WorkflowTrigger | null, newTrigger: WorkflowTrigger | null, workflowId: string) => Promise<void>
}

export type ClientTriggerDefinition = {
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

export function createSharedTriggerDefinition(def: SharedTriggerDefinition) {
    return def
}

export function createServerTriggerDefinition(sharedDef: SharedTriggerDefinition, def: ServerTriggerDefinition) {
    return _.merge({}, sharedDef, def)
}

export function createClientTriggerDefinition(sharedDef: SharedTriggerDefinition, def: ClientTriggerDefinition) {
    return _.merge({}, sharedDef, def)
}

export type MergedClientTriggerDefinition = SharedTriggerDefinition & ClientTriggerDefinition & { id: string }
export type MergedServerTriggerDefinition = SharedTriggerDefinition & ServerTriggerDefinition & { id: string }


/* -------------------------------------------------------------------------- */
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */

export type ServiceAuthAcquisitionMethod = "oauth2" | "key" | "user-pass"

export type SharedServiceDefinition<M extends ServiceAuthAcquisitionMethod = ServiceAuthAcquisitionMethod> = {
    name: string
    authAcquisition: {
        method: M
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

export type ClientServiceDefinition<T extends SharedServiceDefinition> = {
    icon: IconType | ComponentType
    color: string
    transformScope?: (scope: string) => string
    // generateKeyUrl?: T["authAcquisition"]["method"] extends "key" ? string : never
    generateKeyUrl?: string
}

export function createSharedServiceDefinition<T extends SharedServiceDefinition>(def: T): SharedServiceDefinition<T["authAcquisition"]["method"]> {
    return def
}

export function createServerServiceDefinition<T extends SharedServiceDefinition>(sharedDef: T, def: ServerServiceDefinition<T>) {
    return _.merge({}, sharedDef, def)
}

export function createClientServiceDefinition<T extends SharedServiceDefinition>(sharedDef: T, def: ClientServiceDefinition<T>) {
    return _.merge({}, sharedDef, def)
}

export type MergedServerServiceDefinition = SharedServiceDefinition & ServerServiceDefinition<SharedServiceDefinition> & { id: string }
export type MergedClientServiceDefinition = SharedServiceDefinition & ClientServiceDefinition<SharedServiceDefinition> & { id: string }


/* -------------------------------------------------------------------------- */
/*                                 Data Types                                 */
/* -------------------------------------------------------------------------- */

export type SharedDataTypeDefinition<Z extends ZodSchema = ZodSchema> = {
    name: string
    description: string
    schema: Z
}

export type ClientDataTypeDefinition<T extends SharedDataTypeDefinition> = {
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

export function createSharedDataTypeDefinition<T extends SharedDataTypeDefinition>(def: T): SharedDataTypeDefinition<T["schema"]> {
    return def
}

export function createClientDataTypeDefinition<T extends SharedDataTypeDefinition>(sharedDef: T, def: ClientDataTypeDefinition<T>) {
    return _.merge({}, sharedDef, def)
}

export type MergedClientDataTypeDefinition = SharedDataTypeDefinition & ClientDataTypeDefinition<SharedDataTypeDefinition> & { id: string }