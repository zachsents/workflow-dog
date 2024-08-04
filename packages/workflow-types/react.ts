import { IconBraces, IconBracketsContain, IconFile, IconHash, IconPhoto, IconTextSize, IconToggleLeftFilled, type Icon } from "@tabler/icons-react"

/* ------------------------------------------------------ */
/* Definitions                                            */
/* ------------------------------------------------------ */
// #region Definitions

export const ValueTypeDefinitions = {
    string: createTypeDef({
        name: "String",
        jsType: "string",
        icon: IconTextSize,
    }),
    number: createTypeDef({
        name: "Number",
        jsType: "number",
        icon: IconHash,
    }),
    boolean: createTypeDef({
        name: "Boolean",
        jsType: "boolean",
        icon: IconToggleLeftFilled,
    }),
    object: createTypeDef({
        name: "Object",
        jsType: "object",
    }),
    list: createTypeDef({
        name: "List",
        jsType: "array",
        icon: IconBracketsContain,
        genericParams: 1,
        specificName: (t): string => {
            if (!t) return "List"
            const tDef = getValueTypeDefinition(t.typeDefinitionId)
            return tDef ? `List of ${tDef.name}s` : "List"
        },
    }),
    record: createTypeDef({
        name: "Record",
        genericParams: 1,
        extends: ["object"],
    }),
    file: createTypeDef({
        name: "File",
        jsType: "object",
        icon: IconFile,
    }),
    image: createTypeDef({
        name: "Image",
        extends: ["file"],
        icon: IconPhoto,
    }),
}


/* ------------------------------------------------------ */
/* Types                                                  */
/* ------------------------------------------------------ */
// #region Types

type TypeDefinitionID = keyof typeof ValueTypeDefinitions

type JSType = "string" | "number" | "boolean" | "object" | "array"

type ValueTypeDefinition = {
    name: string
    jsType: JSType
    extends: string[]
    genericParams: number
    icon: Icon
    specificName?: (...genericParams: ValueTypeUsage[]) => string
}

export type ValueTypeUsage = {
    typeDefinitionId: TypeDefinitionID
    genericParams: ValueTypeUsage[]
}


/* ------------------------------------------------------ */
/* Helpers                                                */
/* ------------------------------------------------------ */
// #region Helpers

export function getValueTypeDefinition(typeDefinitionId: string): ValueTypeDefinition | undefined {
    return typeDefinitionId in ValueTypeDefinitions
        ? ValueTypeDefinitions[typeDefinitionId as TypeDefinitionID]
        : undefined
}

function createTypeDef(opts: Partial<ValueTypeDefinition>): ValueTypeDefinition {
    return {
        name: "Unknown",
        jsType: "object",
        extends: [],
        genericParams: 0,
        icon: IconBraces,
        ...opts
    }
}

export function useValueType(
    typeDefinitionId: TypeDefinitionID,
    generics: ValueTypeUsage[] = []
): ValueTypeUsage {
    const td = ValueTypeDefinitions[typeDefinitionId]
    if (!td) throw new Error(`Type definition not found: ${typeDefinitionId}`)
    if (td.genericParams !== generics.length)
        throw new Error(`Type definition ${typeDefinitionId} expects ${td.genericParams} generic params, got ${generics.length}`)

    return {
        typeDefinitionId,
        genericParams: generics
    }
}

export function doTypesMatch(a: ValueTypeUsage, b: ValueTypeUsage): boolean {
    if (a.typeDefinitionId !== b.typeDefinitionId) {
        const aDef = ValueTypeDefinitions[a.typeDefinitionId]

        const hasInheritedMatch = aDef.extends.some(
            e => e in ValueTypeDefinitions
                && doTypesMatch(useValueType(e as TypeDefinitionID, a.genericParams), b)
        )

        if (!hasInheritedMatch)
            return false
    }
    return a.genericParams.length !== b.genericParams.length
        && a.genericParams.every((a, i) => doTypesMatch(a, b.genericParams[i]))
}