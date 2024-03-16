import type { SharedDataTypeDefinition, SharedNodeDefinition, SharedServiceDefinition, SharedTriggerDefinition, WebDataTypeDefinition, WebNodeDefinition, WebServiceDefinition, WebTriggerDefinition } from "@types"
import { webNodes } from "./_barrel-web-nodes"
import { webTriggers } from "./_barrel-web-triggers"
import { createExport } from "./util"
import { webServices } from "./_barrel-web-services"
import { webDataTypes } from "./_barrel-web-data-types"

type AggregateWebNodeDefinition = SharedNodeDefinition & WebNodeDefinition<any> & { id: string }

export const NodeDefinitions = createExport(webNodes as Record<string, AggregateWebNodeDefinition>)

type AggregateWebTriggerDefinition = SharedTriggerDefinition & WebTriggerDefinition<any> & { id: string }

export const TriggerDefinitions = createExport(webTriggers as Record<string, AggregateWebTriggerDefinition>)

type AggregateWebServiceDefinition = SharedServiceDefinition & WebServiceDefinition<any> & { id: string }

export const ServiceDefinitions = createExport(webServices as Record<string, AggregateWebServiceDefinition>)

export type AggregateWebDataTypeDefinition = SharedDataTypeDefinition & WebDataTypeDefinition<any> & { id: string }

export const DataTypeDefinitions = createExport(webDataTypes as Record<string, AggregateWebDataTypeDefinition>)