import { IconSquare } from "@tabler/icons-react"
import type { ClientDefinition, ClientEventType, ClientEventTypeIO, ClientNodeDefinition } from "./types/client"
import defaultColors from "tailwindcss/colors"


export const nodeDefs: Record<string, ClientNodeDefinition> = {}
export const eventTypes: Record<string, ClientEventType> = {}


const GLOBAL_DEFAULTS = {
    color: "gray",
    icon: IconSquare,
    keywords: [] as string[],
} satisfies Partial<ClientDefinition>

export function createPackageHelper(packageName: string) {
    return {
        registerNodeDef: createRegistryBuilderFn(nodeDefs, packageName, {
            name: "Unknown Node",
            description: "Doesn't do anything.",
            ...GLOBAL_DEFAULTS,
        }),
        registerEventType: createRegistryBuilderFn(eventTypes, packageName, {
            name: "Unknown Event",
            description: "Doesn't do anything.",
            ...GLOBAL_DEFAULTS,
            workflowInputs: {} as Record<string, ClientEventTypeIO>,
            workflowOutputs: {} as Record<string, ClientEventTypeIO>,
        }),
    }
}


/**
 * Creates a builder function for a registry. Just a convenient
 * utility to keep things DRYer.
 */
function createRegistryBuilderFn<T, Defaults extends WithoutId<Partial<T>>>(
    target: Record<string, T>,
    idPrefix: string,
    defaults: Defaults,
): RegistryBuilderFn<T, Defaults> {
    return (id, opts) => {
        const def = {
            ...defaults,
            ...opts,
            id: `${idPrefix}/${id}`,
        }

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

        target[def.id] = def as T
    }
}


/* Utility types ---------------------------------------- */

type RegistryBuilderFn<T, Defaults> = (id: string, opts: OptionsWithDefaults<T, Defaults>) => void
type OptionsWithDefaults<T, Defaults> = WithoutId<Omit<T, RequiredKeys<Defaults>> & Partial<Defaults>>
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T]
type WithoutId<T> = Omit<T, "id">