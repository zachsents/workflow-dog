

export function createExport<T, K extends string>(obj: Record<K, T>) {

    const ids = Object.keys(obj) as K[]

    const resolveId = (...args: string[]) => {
        const path = args.flatMap(arg => arg.split(/[\/_]/)).join("/")
        return ids.find(k => k.endsWith(path))
    }

    const map = new Map(Object.entries(obj)) as Map<K, T>

    return {
        asObject: obj,
        asArray: Object.values(obj) as T[],
        asMap: map,
        ids,
        resolveId,
        resolve: (...args: string[]) => map.get(resolveId(...args)!),
        safeName: (id: K) => id.split("/").slice(-2).join("_"),
        get: (id: K) => map.get(id),
    }
}

