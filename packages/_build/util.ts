

export function createExport<T extends Record<string, object>>(obj: T) {

    const ids = Object.keys(obj) as (keyof T)[]

    const resolveId = (...args: string[]) => {
        const path = args.flatMap(arg => arg.split(/[\/_]/)).join("/")
        return ids.find(k => k.toString().endsWith(path))
    }

    const map = new Map(Object.entries(obj)) as Map<keyof T, T[keyof T]>

    return {
        asObject: obj,
        asArray: Object.values(obj) as T[keyof T][],
        asMap: map,
        ids,
        resolveId,
        resolve: (...args: string[]) => obj[resolveId(...args)!],
        safeName: (id: keyof T) =>  id.toString().split("/").slice(-2).join("_"),
        get: (id: keyof T) => map.get(id),
    } as const
}

