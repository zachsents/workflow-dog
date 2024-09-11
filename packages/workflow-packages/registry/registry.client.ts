import defaultColors from "tailwindcss/colors"
import type { ClientDefinition, ClientEventType, ClientNodeDefinition, ClientValueTypeDefinition } from "../lib/types"
import { createRegistryFn, EVENT_TYPE_ID_PREFIX, NODE_ID_PREFIX, VALUE_TYPE_ID_PREFIX } from "../lib/utils"
import { CLIENT_EVENT_TYPE_DEFAULTS, CLIENT_NODE_DEFAULTS, CLIENT_VALUE_TYPE_DEFAULTS } from "./defaults.client"


export const nodes: Record<string, ClientNodeDefinition> = {}
export const eventTypes: Record<string, ClientEventType> = {}
export const valueTypes: Record<string, ClientValueTypeDefinition> = {}


export function createPackage<NodeDefault extends Partial<ClientNodeDefinition>>(packageName: string, options: {
    defaults?: {
        node?: NodeDefault
    }
} = {}) {
    return {
        node: createRegistryFn(nodes, {
            idPrefix: NODE_ID_PREFIX,
            defaults: { ...CLIENT_NODE_DEFAULTS, ...options.defaults?.node } as NodeDefault & typeof CLIENT_NODE_DEFAULTS,
            postProcess: postProcessColors,
            packageName,
        }),
        eventType: createRegistryFn(eventTypes, {
            idPrefix: EVENT_TYPE_ID_PREFIX,
            defaults: CLIENT_EVENT_TYPE_DEFAULTS,
            postProcess: postProcessColors,
            packageName,
        }),
        valueType: createRegistryFn(valueTypes, {
            idPrefix: VALUE_TYPE_ID_PREFIX,
            defaults: CLIENT_VALUE_TYPE_DEFAULTS,
            postProcess: postProcessColors,
            packageName,
        }),
    }
}


function postProcessColors(def: ClientDefinition) {
    if ("color" in def && typeof def.color === "string" && !def.color.startsWith("#")) {
        const [color, shade] = def.color.split(".") as [string, string | undefined]

        if (color in defaultColors) {
            const colorSwatch = defaultColors[color as keyof typeof defaultColors]
            const isShade = typeof shade === "string"
                && typeof colorSwatch === "object"
                && shade in colorSwatch
            def.color = colorSwatch[isShade ? (shade as keyof typeof colorSwatch) : "600"]
        }
    }
}