import { z } from "zod"
import { ServerValueTypes } from "../server"


export function encodeValue(value: unknown) {
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
            value: chosen.toJSON(value, encodeValue),
        }
    }

    try {
        JSON.stringify(value)
    } catch (err) {
        throw new Error(`Couldn't find a way to convert value to JSON: ${value}`)
    }

    return { typeId: chosen.id, value }
}

export function decodeValue(encodedValue: unknown) {
    const { typeId, value } = z.object({
        typeId: z.string(),
        value: z.any(),
    }).parse(encodedValue)

    const def = ServerValueTypes[typeId]
    if (!def)
        throw new Error(`Couldn't find a way to decode value of type ${typeId}: ${value}`)

    if (def.fromJSON) {
        return def.fromJSON(value, decodeValue)
    }

    return value
}