

export function createExport<G extends object, T extends Record<string, G>>(obj: T) {

    const ids = Object.keys(obj) as (keyof T)[]

    const resolveId = (...args: string[]) => {
        const path = args.flatMap(arg => arg.split(/[\/_]/)).join("/")
        return ids.find(k => k.toString().endsWith(path))
    }

    const map = new Map(Object.entries(obj))

    return {
        asObject: obj,
        asArray: Object.values(obj),
        asMap: map,
        ids,
        resolveId,
        resolve: (...args: string[]): G => obj[resolveId(...args)!],
        safeName: (id: string) => id.split("/").slice(-2).join("_"),
        get: (id: string): G | undefined => map.get(id),
    } as const
}

