import { useMemo } from "react"
import { z } from "zod"
import { ClientValueTypes } from "../client"
import type { ValueTypeUsage } from "./types"
import { VALUE_TYPE_ID_PREFIX } from "./utils"


export function ValueDisplay({ encodedValue, mode }: {
    encodedValue: any
    mode: "preview" | "full"
}) {
    const { success, data } = useMemo(() => z.object({
        typeId: z.enum(Object.keys(ClientValueTypes) as [string, ...string[]]),
        value: z.any(),
    }).safeParse(encodedValue), [encodedValue])

    if (!success)
        return <p className="text-destructive italic">Invalid value</p>

    const def = ClientValueTypes[data.typeId]
    switch (mode) {
        case "preview": return <def.previewComponent value={data.value} />
        case "full": return <def.fullComponent value={data.value} />
    }
}

export function useValueType(
    typeDefinitionId: string,
    generics: ValueTypeUsage[] = []
): ValueTypeUsage {
    const fullId = inferValueTypeId(typeDefinitionId)
    if (!fullId)
        throw new Error(`Type definition not found: ${typeDefinitionId}`)

    const td = ClientValueTypes[fullId]

    if (td.genericParams !== generics.length)
        throw new Error(`Type definition ${typeDefinitionId} expects ${td.genericParams} generic params, got ${generics.length}`)

    return {
        typeDefinitionId: fullId,
        genericParams: generics
    }
}

export function inferValueTypeId(partialTypeId: string): string | undefined {
    let def = ClientValueTypes[partialTypeId]
    def ??= ClientValueTypes[`${VALUE_TYPE_ID_PREFIX}:${partialTypeId}`]
    def ??= ClientValueTypes[`${VALUE_TYPE_ID_PREFIX}:primitives/${partialTypeId}`]
    return def?.id
}