

export const Type = {
    String: () => ({ baseType: "string" }),
    Boolean: () => ({ baseType: "boolean" }),
    Number: () => ({ baseType: "number" }),
    Date: () => ({ baseType: "date" }),
    Object: (schema) => ({ baseType: "object", schema }),
    Array: (itemType) => ({ baseType: "array", itemType }),
    Any: () => ({ any: true }),
    StringEnum: (...enumValues) => ({ baseType: "string", enumValues }),
}


/**
 * @param {Type} typeA
 * @param {Type} typeB
 */
export function doTypesMatch(typeA, typeB) {
    if (typeA.any || typeB.any)
        return true

    if (typeA.baseType !== typeB.baseType)
        return false

    if (typeA.enumValues && typeB.enumValues && !typeA.enumValues.some(v => typeB.enumValues.includes(v)))
        return false

    if (typeA.baseType === "array" && typeB.baseType === "array" && !doTypesMatch(typeA.itemType, typeB.itemType))
        return false

    return true
}


export function typeLabel(type) {
    if (type.any)
        return "Any"

    if (type.baseType === "string")
        return "Text"

    if (type.baseType === "boolean")
        return "Boolean"

    if (type.baseType === "number")
        return "Number"

    if (type.baseType === "date")
        return "Date"

    if (type.baseType === "object")
        return "Object"

    if (type.baseType === "array")
        return `Array<${typeLabel(type.itemType)}>`

    return "Unknown"
}


/**
 * @typedef {object} Type
 * @property {string} baseType
 * @property {any[]} enumValues
 * @property {Type} itemType
 * @property {Record<string, Type>} schema
 * @property {boolean} any
 */
