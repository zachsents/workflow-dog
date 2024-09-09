import { z } from "zod"
import { ServerValueTypes } from "../server"


export function jsonifyValue(value: unknown) {
    if (!!value && typeof value === "object" && "toEncodedValue" in value && typeof value.toEncodedValue === "function") {
        return z.object({
            typeId: z.string(),
            value: z.any(),
        }).parse(value.toEncodedValue())
    }

    const applicable = Object.values(ServerValueTypes).filter(def => def.isApplicable?.(value)) ?? []

    const chosen = applicable.reduce((acc, cur) => {
        return (cur.conversionPriority ?? 0) > (acc.conversionPriority ?? 0) ? cur : acc
    })

    if (chosen.toJSON) {
        return {
            typeId: chosen.id,
            value: chosen.toJSON(value, jsonifyValue),
        }
    }

    throw new Error(`Couldn't find a way to convert value to JSON: ${value}`)
}