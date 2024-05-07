import _ from "lodash"
import { customAlphabet } from "nanoid"
import { alphanumeric } from "nanoid-dictionary"
import { forwardRef, useEffect, useMemo, useState } from "react"
import { Subject, debounceTime, tap } from "rxjs"


/**
 * Generates a random alphanumeric string with an optional prefix
 */
export function uniqueId(prefixOrOptions: string | {
    prefix?: string
    colon?: boolean
    length?: number
} = {}) {
    if (typeof prefixOrOptions === "string")
        return uniqueId({ prefix: prefixOrOptions })

    const { prefix, colon = true, length = 10 } = prefixOrOptions
    const genId = customAlphabet(alphanumeric, length)

    return prefix ? `${prefix}${colon ? ":" : ""}${genId()}` : genId()
}


export function useDebouncedState<T>(initialValue: T, {
    debounce = 500,
    syncWithInitialValue = false,
    onChange,
}: {
    debounce?: number
    syncWithInitialValue?: boolean
    onChange?: (value: T) => void
} = {}) {

    const [value, setValue] = useState(initialValue)
    const [debouncedValue, setDebouncedValue] = useState(initialValue)
    const [changing, setChanging] = useState(false)

    const subject: Subject<T> = useMemo(() => new Subject(), [])

    useEffect(() => {
        const subscription = subject
            .pipe(
                debounceTime(debounce),
                tap(() => setChanging(false)),
            )
            .subscribe(setDebouncedValue)
        return () => subscription.unsubscribe()
    }, [debounce, setChanging])

    const updateValue = (newValue: T, skipDebounce = false) => {
        setValue(newValue)
        if (skipDebounce)
            setDebouncedValue(newValue)
        else {
            setChanging(true)
            subject.next(newValue)
        }
    }

    useEffect(() => {
        if (syncWithInitialValue && initialValue !== undefined)
            updateValue(initialValue, true)
    }, [initialValue, syncWithInitialValue])

    useEffect(() => {
        onChange?.(debouncedValue)
    }, [debouncedValue])

    return [value, debouncedValue, updateValue, changing] as const
}


export function useSyncToState<T>(value: T, setOtherValue: (value: T) => void) {
    useEffect(() => {
        if (value !== undefined)
            setOtherValue(value)
    }, [value])

    return () => setOtherValue(value)
}


export function useMountDelay(delay: number = 1000, {
    callback,
    enabled = true,
}: {
    callback?: () => void
    enabled?: boolean
} = {}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!enabled)
            return

        const timer = setTimeout(() => {
            setMounted(true)
        }, delay)

        return () => clearTimeout(timer)
    }, [delay, enabled])

    useEffect(() => {
        if (mounted)
            callback?.()
    }, [mounted])

    return mounted
}


/**
 * Returns a hashed string from the given value
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function stringHash(value: any) {
    const str: string = {
        "string": value,
        "undefined": "undefined"
    }[typeof value] ?? JSON.stringify(value)

    let hash = 0
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash.toString(16)
}


export function useHover() {
    const [hovered, setHovered] = useState(false)

    const handlers = {
        onPointerEnter: () => setHovered(true),
        onPointerLeave: () => setHovered(false),
    }

    return [hovered, handlers] as const
}


export function useControlledSelectedKeys<T>(value: T, setValue: (value: T) => void) {
    const selectedKeys = useMemo(() => new Set(value ? [value] : []), [value])
    const onSelectionChange = (keys: Set<T>) => {
        setValue(keys.values().next().value)
    }

    return { selectedKeys, onSelectionChange }
}


export type DotPath<T> = T extends object ? { [K in keyof T]:
    `${Exclude<K, symbol>}${"" | `.${DotPath<T[K]>}`}`
}[keyof T] : never


export type TagOrComponent = keyof JSX.IntrinsicElements | React.ComponentType

export function extendComponent<C extends TagOrComponent, P extends React.PropsWithoutRef<React.ComponentProps<C>> = React.PropsWithoutRef<React.ComponentProps<C>>>(
    render: (
        props: P,
        ref: React.ForwardedRef<React.ElementRef<C>>
    ) => React.ReactNode
) {
    return forwardRef<React.ElementRef<C>, P>(render)
}

export type ExtendProps<C extends TagOrComponent, P extends Record<string, any>> = React.PropsWithoutRef<React.ComponentProps<C>> & P
