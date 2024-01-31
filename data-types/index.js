import { object as typeMap } from "./common.js"


export function doTypesMatch(a, b) {
    if (a == null || b == null)
        return true

    if (a === b)
        return true

    const typeA = typeMap[a]
    const typeB = typeMap[b]

    if (typeA.compatibleWith.includes(b))
        return true

    if (typeB.compatibleWith.includes(a))
        return true

    return false
}