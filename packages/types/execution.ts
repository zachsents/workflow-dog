import type { z } from "zod"
import type { DataInterface, MergedExport, SharedNodeDefinition } from "./shared"
import type { Node } from "shared/types"

export type InterfaceValueRecord<
    T extends SharedNodeDefinition,
    IK extends "inputs" | "outputs",
> = {
        [K in keyof T[IK]]: T[IK] extends Record<string, DataInterface>
        ? z.infer<T[IK][K]["schema"]>
        : never
    }

export interface ExecutionNodeDefinition<Shared extends SharedNodeDefinition> {
    action: (inputs: InterfaceValueRecord<Shared, "inputs">, info: {
        node: Node
        triggerData: any
        workflowId: string
        projectId: string
        token?: { access_token?: string, key?: string }
    }) => InterfaceValueRecord<Shared, "outputs">
        | Promise<InterfaceValueRecord<Shared, "outputs">>
}

export type ExecutionNodeExport = MergedExport<SharedNodeDefinition, ExecutionNodeDefinition<SharedNodeDefinition>>
