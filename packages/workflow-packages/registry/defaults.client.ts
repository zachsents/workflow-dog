import { IconSquare } from "@tabler/icons-react"
import type { ClientDefinition, ClientEventType, ClientEventTypeIO, ClientNodeDefinition, ClientValueTypeDefinition } from "../lib/types"


export const GLOBAL_CLIENT_DEFAULTS = {
    color: "gray",
    icon: IconSquare,
    keywords: [] as string[],
} satisfies Partial<ClientDefinition>

export const CLIENT_NODE_DEFAULTS = {
    ...GLOBAL_CLIENT_DEFAULTS,
} satisfies Partial<ClientNodeDefinition>

export const CLIENT_EVENT_TYPE_DEFAULTS = {
    ...GLOBAL_CLIENT_DEFAULTS,
    workflowInputs: {} as Record<string, ClientEventTypeIO>,
    workflowOutputs: {} as Record<string, ClientEventTypeIO>,
} satisfies Partial<ClientEventType>

export const CLIENT_VALUE_TYPE_DEFAULTS = {
    ...GLOBAL_CLIENT_DEFAULTS,
    genericParams: 0,
} satisfies Partial<ClientValueTypeDefinition>