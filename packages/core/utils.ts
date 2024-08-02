import _ from "lodash"


export function mergeObjectsOverwriteArrays<A extends Record<string, any>, B extends Record<string, any>>(a: A, b: B) {
    return _.mergeWith({}, a, b, (objValue, srcValue) => {
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
                ? v(_.omit(promises, k))
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
