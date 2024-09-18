import _mergeWith from "lodash/mergeWith"
import _omit from "lodash/omit"


export function mergeObjectsOverwriteArrays<A extends Record<string, any>, B extends Record<string, any>>(a: A, b: B) {
    return _mergeWith({}, a, b, (objValue, srcValue) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue))
            return srcValue
    })
}


export async function promiseChain<T extends Record<string, any>>(input: {
    [K in keyof T]: Promise<T[K]> | ((promises: {
        [K2 in Exclude<keyof T, K>]: Promise<T[K2]>
    }) => Promise<T[K]>)
}): Promise<T> {

    const resolveFns: any = {}
    const promises = Object.fromEntries(
        Object.keys(input)
            .map(k => [k, new Promise(resolve => {
                resolveFns[k] = resolve
            })])
    )

    Object.entries(input).forEach(([k, v]) => {
        Promise.resolve(
            typeof v === "function"
                ? v(_omit(promises, k))
                : v
        ).then(resolveFns[k])
    })

    return Object.fromEntries(
        await Promise.all(
            Object.entries(promises)
                .map(async ([k, v]) => [k, await v] as const)
        )
    ) as T
}


/**
 * Just wrote this for a Twitter conversation, but looks like it 
 * could be useful. Or maybe just slop. We'll see.
 */
export async function tryAsync<T>(promise: Promise<T>): Promise<readonly [T | undefined, Error | undefined]> {
    return promise
        .then(r => [r, undefined] as const)
        .catch((err: Error) => [undefined, err] as const)
}


export function getObjectPaths(obj: any, startingPath: string = ""): string[] {
    if (typeof obj !== "object" || obj === null || Object.keys(obj).length === 0)
        return startingPath ? [startingPath] : []

    return Object.entries(obj).flatMap(
        ([k, v]) => getObjectPaths(v, `${startingPath}${startingPath ? "." : ""}${k}`)
    )
}