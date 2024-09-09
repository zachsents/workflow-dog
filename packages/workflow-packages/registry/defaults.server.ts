import type { ServerDefinition, ServerEventSourceDefinition, ServerEventType, ServerNodeDefinition, ServerValueTypeDefinition } from "../lib/types"

export const GLOBAL_SERVER_DEFAULTS = {
    // none yet
} satisfies Partial<ServerDefinition>

export const SERVER_NODE_DEFAULTS = {
    ...GLOBAL_SERVER_DEFAULTS,
} satisfies Partial<ServerNodeDefinition>

export const SERVER_EVENT_TYPE_DEFAULTS = {
    ...GLOBAL_SERVER_DEFAULTS,
} satisfies Partial<ServerEventType>

export const SERVER_EVENT_SOURCE_DEFAULTS = {
    ...GLOBAL_SERVER_DEFAULTS,
} satisfies Partial<ServerEventSourceDefinition>

export const SERVER_VALUE_TYPE_DEFAULTS = {
    ...GLOBAL_SERVER_DEFAULTS,
} satisfies Partial<ServerValueTypeDefinition>