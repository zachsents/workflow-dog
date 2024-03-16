

export function createExport<T>(obj: Record<string, T>): {
    asObject: Record<string, T>,
    asArray: T[],
    asMap: Map<string, T>,
    ids: string[],
    resolveId: (...args: string[]) => string | undefined,
    resolve: (...args: string[]) => T | undefined,
    safeName: (id: string) => string,
    get: (id: string) => T | undefined,
} {
    const arr = Object.values(obj)
    const map = new Map(Object.entries(obj))

    const resolveId = (...args: string[]) => {
        const path = args.flatMap(arg => arg.split(/[\/_]/)).join("/")
        return Object.keys(obj).find(k => k.endsWith(path))
    }

    return {
        asObject: obj,
        asArray: arr,
        asMap: map,
        ids: Object.keys(obj),
        resolveId,
        resolve: (...args: string[]) => map.get(resolveId(...args)),
        safeName: (id: string) => id.split("/").slice(-2).join("_"),
        get: (id: string) => map.get(id),
    }
}

