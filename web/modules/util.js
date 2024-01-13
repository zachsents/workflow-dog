import _ from "lodash"
import { useEffect } from "react"
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