import { IconSquare } from "@tabler/icons-react"
import type { ClientDefinition, ClientEventType, ClientEventTypeIO, ClientNodeDefinition } from "./types/client"
import defaultColors from "tailwindcss/colors"
import { createRegistryBuilderFn } from "./utils"


export const nodeDefs: Record<string, ClientNodeDefinition> = {}
export const eventTypes: Record<string, ClientEventType> = {}


const GLOBAL_DEFAULTS = {
    color: "gray",
    icon: IconSquare,
    keywords: [] as string[],
} satisfies Partial<ClientDefinition>


export function createPackageHelper(packageName: string) {

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

    return {
        registerNodeDef: createRegistryBuilderFn(nodeDefs, `node:${packageName}`, {
            name: "Unknown Node",
            description: "Doesn't do anything.",
            ...GLOBAL_DEFAULTS,
        }, postProcessColors),
        registerEventType: createRegistryBuilderFn(eventTypes, `eventType:${packageName}`, {
            name: "Unknown Event",
            description: "Doesn't do anything.",
            ...GLOBAL_DEFAULTS,
            workflowInputs: {} as Record<string, ClientEventTypeIO>,
            workflowOutputs: {} as Record<string, ClientEventTypeIO>,
        }, postProcessColors),
    }
}
