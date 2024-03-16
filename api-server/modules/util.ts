import mergeWith from "lodash.mergewith"


export function mergeObjectsOverwriteArrays(a: any, b: any) {
    return mergeWith({}, a, b, (objValue, srcValue) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue))
            return srcValue
    })
}
