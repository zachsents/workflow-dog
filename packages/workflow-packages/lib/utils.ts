/***
 * Everything in here must be isomorphic.
 */


export const NODE_ID_PREFIX = "node"
export const EVENT_TYPE_ID_PREFIX = "eventType"
export const EVENT_SOURCE_ID_PREFIX = "eventSource"
export const VALUE_TYPE_ID_PREFIX = "valueType"


export function createRegistryFn<Def, Defaults extends Partial<Def>>(target: Record<string, Def>, {
    packageName, defaults, idPrefix, postProcess,
}: {
    packageName: string
    idPrefix: string
    defaults: Defaults
    postProcess?: (def: Def) => void
}) {
    return (id: string, def: Omit<Def, "id" | keyof RequiredFieldsOnly<Defaults>> & Partial<Defaults>): Def => {
        const compiledDef = {
            ...defaults,
            ...def,
            id: `${idPrefix}:${packageName}/${id}`,
        } as Def
        postProcess?.(compiledDef)
        target[(compiledDef as any).id] = compiledDef
        return compiledDef
    }
}


/* Utility types ---------------------------------------- */

export type RequiredFieldsOnly<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
}