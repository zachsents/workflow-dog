import _ from "lodash"
import { customAlphabet } from "nanoid"
import { alphanumeric } from "nanoid-dictionary"
import { useCallback, useEffect, useMemo, useRef, useState, type DependencyList } from "react"
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


/**
 * Converts an object's properties to camelCase deeply
 */
export function deepCamelCase<T extends object>(obj: T, options: {
    excludeDashedKeys?: boolean
    excludeColonKeys?: boolean
} = {}) {
    if (Array.isArray(obj))
        return obj.map(item => _.isObjectLike(item) ? deepCamelCase(item, options) : item)

    if (_.isObjectLike(obj)) {
        const withNewKeys = _.mapKeys(
            obj,
            (__, key) => {
                if (options.excludeColonKeys && key.includes?.(":"))
                    return key
                if (options.excludeDashedKeys && key.includes?.("-"))
                    return key

                return _.camelCase(key)
            }
        )

        return _.mapValues(
            withNewKeys,
            val => _.isObjectLike(val) ? deepCamelCase(val as object, options) : val
        )
    }

    return obj
}


export function useSyncedRef<T>(value: T) {
    const ref = useRef(value)
    ref.current = value
    return ref
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
 * @param hotkey e.g. "ctrl+b"
 */
export function useHotkey(hotkey: string, callback: (ev: KeyboardEvent) => void, {
    target = window,
    event = "keydown",
    eventOptions = {},
    preventDefault = false,
    callbackDependencies = [],
    qualifier,
    preventInInputs = false,
}: {
    target?: HTMLElement | Window
    event?: string
    eventOptions?: object
    preventDefault?: boolean
    callbackDependencies?: DependencyList
    qualifier?: (event: KeyboardEvent) => boolean
    preventInInputs?: boolean
} = {}) {

    const wrappedCallback = useCallback(callback, callbackDependencies)

    const [modifierKeys, key] = useMemo(() => {
        const keys = hotkey.toLowerCase().split(/[+\s]+/g)
        return [keys, keys.pop()]
    }, [hotkey])

    useEffect(() => {
        const handler = (ev: KeyboardEvent) => {
            const modifiersSatisfied = Object.entries(modifiers)
                .every(([modKey, modFn]) => modifierKeys.includes(modKey) === modFn(ev))

            if (!modifiersSatisfied)
                return

            if (ev.key.toLowerCase() !== key)
                return

            if (typeof qualifier === "function" && !qualifier(ev))
                return

            if (preventInInputs && blacklistedTags.includes(document.activeElement.tagName))
                return

            if (preventDefault)
                ev.preventDefault()

            wrappedCallback(ev)
        }

        target.addEventListener(event, handler, eventOptions)
        return () => target.removeEventListener(event, handler)
    }, [modifiers, key, wrappedCallback, target, event, JSON.stringify(eventOptions), preventDefault])
}


const modifiers: Record<"mod" | "shift" | "alt", (ev: KeyboardEvent) => boolean> = {
    mod: ev => ev.ctrlKey || ev.metaKey,
    shift: ev => ev.shiftKey,
    alt: ev => ev.altKey,
}

const blacklistedTags = ["INPUT", "TEXTAREA", "SELECT"]



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


export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>

export type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends {} ? KeysToCamelCase<T[K]> : T[K]
}
