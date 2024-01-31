import _ from "lodash"
import { useEffect } from "react"
import { useCallback } from "react"
import { useMemo } from "react"
import { useState } from "react"
import { useRef } from "react"
import { Subject, debounceTime, tap } from "rxjs"


export function deepCamelCase(obj) {
    if (obj instanceof Array)
        return obj.map(deepCamelCase)

    if (obj?.constructor === Object) {
        const withNewKeys = _.mapKeys(obj, (v, key) => _.camelCase(key))
        return _.mapValues(withNewKeys, deepCamelCase)
    }

    return obj
}


export function useSyncedRef(value) {
    const ref = useRef(value)
    ref.current = value
    return ref
}


/**
 * @template T
 * @param {T} initialValue
 * @param {object} options
 * @param {number} options.debounce
 * @param {boolean} options.syncWithInitialValue
 * @param {(value: T) => void} options.onChange
 * @returns {[T, T, (value: T, skipDebounce?: boolean) => void, boolean]}
 */
export function useDebouncedState(initialValue, {
    debounce = 500,
    syncWithInitialValue = false,
    onChange,
} = {}) {

    const [value, setValue] = useState(initialValue)
    const [debouncedValue, setDebouncedValue] = useState(initialValue)
    const [changing, setChanging] = useState(false)

    /** @type {Subject} */
    const subject = useMemo(() => new Subject().pipe(
        debounceTime(debounce),
        tap(() => setChanging(false)),
    ), [debounce])

    useEffect(() => {
        const subscription = subject.subscribe(setDebouncedValue)
        return () => subscription.unsubscribe()
    }, [subject])

    const updateValue = (newValue, skipDebounce = false) => {
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

    return [value, debouncedValue, updateValue, changing]
}


export function useSyncToState(value, setOtherValue) {
    useEffect(() => {
        if (value !== undefined)
            setOtherValue(value)
    }, [value])

    return () => setOtherValue(value)
}


export function useMountDelay(delay = 1000, {
    callback,
    enabled = true,
} = {}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!enabled)
            return

        const timeoutId = setTimeout(() => {
            setMounted(true)
        }, delay)

        return () => clearTimeout(timeoutId)
    }, [delay, enabled])

    useEffect(() => {
        if (mounted) callback?.()
    }, [mounted])

    return mounted
}


/**
 * @param {string} hotkey - e.g. "ctrl+b"
 * @param {(event: KeyboardEvent) => void} callback
 * @param {object} options
 * @param {HTMLElement} options.target
 * @param {string} options.event
 * @param {object} options.eventOptions
 * @param {boolean} options.preventDefault
 * @param {any[]} options.callbackDependencies
 * @param {(event: KeyboardEvent) => boolean} options.qualifier
 * @param {boolean} options.preventInInputs
 */
export function useHotkey(hotkey, callback, {
    target = window,
    event = "keydown",
    eventOptions = {},
    preventDefault = false,
    callbackDependencies = [],
    qualifier,
    preventInInputs = false,
} = {}) {

    const wrappedCallback = useCallback(callback, callbackDependencies)

    const [modifierKeys, key] = useMemo(() => {
        const keys = hotkey.toLowerCase().split(/[+\s]+/g)
        return [keys, keys.pop()]
    }, [hotkey])

    useEffect(() => {
        if (!target || !callback)
            return

        /**
         * @param {KeyboardEvent} ev
         */
        const handler = ev => {
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


const modifiers = {
    mod: ev => ev.ctrlKey || ev.metaKey,
    shift: ev => ev.shiftKey,
    alt: ev => ev.altKey,
}

const blacklistedTags = ["INPUT", "TEXTAREA", "SELECT"]



/**
 * Returns a hash code from a string
 * @param  {string | object} value A string or object to hash. If an object is passed, it will be JSON-stringified first.
 * @return {string} The hash code
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function stringHash(value) {
    const str = {
        string: value,
        undefined: "undefined",
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

    return [hovered, handlers]
}