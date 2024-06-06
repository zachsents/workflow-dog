import { TypeMetaDefinitions } from "@pkg/client"
import { TbBracketsContain, TbSquare } from "react-icons/tb"
import { IdNamespace } from "shared/utils"
import { ZodArray, ZodUnion, type ZodType, ZodAny } from "zod"


export function createTypeLabel(schema: ZodType): string {
    if (schema instanceof ZodArray) {
        const item: ZodType = schema._def.type
        return `List of ${createTypeLabel(item)}`
    }

    if (schema instanceof ZodUnion) {
        const options: ZodType[] = schema._def.options
        return options.map(createTypeLabel).join(" or ")
    }

    if (schema.description?.startsWith(IdNamespace.TypeMeta)) {
        const typeMeta = TypeMetaDefinitions.get(schema.description)
        if (typeMeta) {
            return typeMeta.name
        }
    }

    if ("typeName" in schema._def && typeof schema._def.typeName === "string")
        return schema._def.typeName.replace("Zod", "")

    return "Unknown"
}


export function getTypeIcon(schema: ZodType) {
    if (schema instanceof ZodArray) {
        return TbBracketsContain
    }

    if (schema.description?.startsWith(IdNamespace.TypeMeta)) {
        const typeMeta = TypeMetaDefinitions.get(schema.description)
        if (typeMeta) {
            return typeMeta.icon
        }
    }

    return TbSquare
}


export function areSchemasCompatible(a: ZodType, b: ZodType) {
    if (a instanceof ZodAny || b instanceof ZodAny)
        return true

    if (a instanceof ZodUnion)
        return a._def.options.some((option: ZodType) => areSchemasCompatible(option, b))
    if (b instanceof ZodUnion)
        return b._def.options.some((option: ZodType) => areSchemasCompatible(a, option))

    if (a instanceof ZodArray && b instanceof ZodArray)
        return areSchemasCompatible(a._def.type, b._def.type)

    if (a.description?.startsWith(IdNamespace.TypeMeta) && b.description?.startsWith(IdNamespace.TypeMeta)) {
        if (a.description === b.description)
            return true

        const aMeta = TypeMetaDefinitions.get(a.description)
        const bMeta = TypeMetaDefinitions.get(b.description)

        if (aMeta && bMeta) {
            return aMeta.compatibleWith?.includes(bMeta.id)
                || bMeta.compatibleWith?.includes(aMeta.id)
        }
    }

    if ((a._def as any).typeName === (b._def as any).typeName)
        return true

    return false
}