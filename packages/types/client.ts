import type { RouterInput, RouterOutput } from "@web/lib/types/trpc"
import type { ComponentType } from "react"
import type { IconType } from "react-icons"
import type { z } from "zod"
import type { DataInterface, MergedExport, SharedNodeDefinition, SharedServiceDefinition, SharedTriggerDefinition, SharedTypeMetaDefinition } from "./shared"



/* ---------------------------------- Nodes --------------------------------- */

export type ClientNodeDefinition<Shared extends SharedNodeDefinition> = {
    icon: IconType | ComponentType
    color: string
    badge?: string
    tags: string[]
    searchTerms?: string[]
    inputs?: {
        [K in keyof Shared["inputs"]]: ClientNodeDefinitionInterface
    }
    outputs?: {
        [K in keyof Shared["outputs"]]: ClientNodeDefinitionInterface
    }

    renderBody?: ComponentType<{ id: string }>
}

export interface ClientNodeDefinitionInterface {
    /** Used for singular inputs for array input types */
    singular?: string
    recommendedNode?: {
        definition: string
        handle: string
        data?: Record<string, any>
    }
}

export type ClientNodeExport = Omit<
    MergedExport<
        SharedNodeDefinition,
        ClientNodeDefinition<SharedNodeDefinition>
    >,
    "inputs" | "outputs"
> & {
    inputs: Record<string, ClientNodeInterfaceExport>
    outputs: Record<string, ClientNodeInterfaceExport>
}

export type ClientNodeInterfaceExport = DataInterface & ClientNodeDefinitionInterface



/* -------------------------------- Triggers -------------------------------- */

export type ClientTriggerDefinition = {
    icon: IconType | ComponentType
    color: string
    tags: string[]
    renderConfig?: ComponentType<{
        workflowId: string
        workflow: RouterOutput["workflows"]["byId"]
        updateConfig: (data: Omit<RouterInput["workflows"]["triggers"]["update"], "triggerId">) => Promise<void>
        isUpdating: boolean
        onClose: () => void
    }>
}

export type ClientTriggerExport = MergedExport<SharedTriggerDefinition, ClientTriggerDefinition>



/* -------------------------------- Services -------------------------------- */

export type ClientServiceDefinition<Shared extends SharedServiceDefinition> = {
    icon: IconType | ComponentType
    color: string
    transformScope?: (scope: string) => string
    generateKeyUrl?: Shared["authorizationMethod"] extends "api_key"
    ? (string | undefined)
    : never
}

export type ClientServiceExport = MergedExport<SharedServiceDefinition, ClientServiceDefinition<SharedServiceDefinition>>



/* -------------------------------- Type Meta -------------------------------- */

export type ClientTypeMetaDefinition<Shared extends SharedTypeMetaDefinition> = {
    icon: IconType | ComponentType
    manualInputComponent?: ComponentType<{
        value: z.infer<Shared["schema"]>
        onChange: (value: z.infer<Shared["schema"]>) => void
        [key: string]: any
    }>
    renderPreview?: ComponentType<{
        value: z.infer<Shared["schema"]>
    }>
    renderExpanded?: ComponentType<{
        value: z.infer<Shared["schema"]>
    }>
    useNativeExpanded?: boolean
}

export type ClientTypeMetaExport = MergedExport<SharedTypeMetaDefinition, ClientTypeMetaDefinition<SharedTypeMetaDefinition>>
