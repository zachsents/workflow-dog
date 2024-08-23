
/**
 * Creates a builder function for a registry. Just a convenient
 * utility to keep things DRYer.
 */
export function createRegistryBuilderFn<T, Defaults extends WithoutId<Partial<T>>>(
    target: Record<string, T>,
    idPrefix: string,
    defaults: Defaults,
    postProcess?: (def: T) => void,
): RegistryBuilderFn<T, Defaults> {
    return (id, opts) => {
        const def = {
            ...defaults,
            ...opts,
            id: `${idPrefix}/${id}`,
        }
        postProcess?.(def as T)
        target[def.id] = def as T
        return def as T
    }
}


/* Utility types ---------------------------------------- */

export type RegistryBuilderFn<T, Defaults> = (id: string, opts: OptionsWithDefaults<T, Defaults>) => T
export type OptionsWithDefaults<T, Defaults> = WithoutId<Omit<T, RequiredKeys<Defaults>> & Partial<Defaults>>
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T]
export type WithoutId<T> = Omit<T, "id">