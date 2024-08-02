import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion"
import Fuse, { type IFuseOptions } from "fuse.js"
import { useEffect, useMemo, useRef, useState } from "react"
import { useHotkeys, type Options as HotKeysOptions } from "react-hotkeys-hook"
import { useSearchParams } from "react-router-dom"

interface UseSearchParamEffectOptions {
    clearAfterEffect?: boolean
}

/**
 * Hook that runs an effect based on the presence of a query parameter.
 */
export function useSearchParamEffect(key: string, cb: (value: string) => void, {
    clearAfterEffect = false,
}: UseSearchParamEffectOptions = {}) {

    const [params, setParams] = useSearchParams()
    const value = params.get(key)

    useEffect(() => {
        if (value == null)
            return

        cb(value)

        if (clearAfterEffect) {
            setParams(Object.fromEntries(
                Array.from(params.entries())
                    .filter(([k]) => k !== key)
            ), { replace: true })
        }
    }, [value])
}


/**
 * Hook that runs an effect only once when the component mounts, even
 * in strict mode.
 */
export function useOnceEffect(callback: () => void, condition = true) {
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current || !condition)
            return
        mounted.current = true
        callback()
    }, [condition])
}


/**
 * Search hook using Fuse
 */
export function useSearch<T, M>(list: T[], {
    mapFn = x => x as unknown as M,
    idKey = "id",
    ...fuseOptions
}: {
    mapFn?: (item: T) => M
    idKey?: string
} & IFuseOptions<M>) {
    const [query, setQuery] = useState("")

    const fuseIndex = useMemo(
        () => new Fuse(list.map(mapFn), fuseOptions),
        [list]
    )

    const filtered = useMemo(() => {
        const trimmedQuery = query.trim()
        if (!trimmedQuery)
            return list
        return fuseIndex.search(trimmedQuery)
            .map(r => list.find(item => (item as any)[idKey] === (r.item as any)[idKey]))
            .filter(Boolean) as T[]
    }, [query, list, fuseIndex])

    return {
        query,
        setQuery,
        clear: () => setQuery(""),
        filtered,
    }
}


/**
 * Simple hook for managing boolean state.
 */
export function useBooleanState(initialState = false) {
    const [state, setState] = useState(initialState)
    const setTrue = () => setState(true)
    const setFalse = () => setState(false)
    return [state, setTrue, setFalse, setState] as const
}


/**
 * Specifically for shadcn Dialog components. Just simplifies
 * the state management for opening and closing dialogs.
 */
export function useDialogState(initialState?: boolean) {
    const [isOpen, open, close, setOpen] = useBooleanState(initialState)
    return {
        isOpen, open, close, setOpen,
        dialogProps: { open: isOpen, onOpenChange: setOpen },
    }
}


/**
 * Hook for the state of a key on the keyboard. Simple wrapper
 * around react-hotkeys-hook.
 */
export function useKeyState(key: string, opts?: HotKeysOptions) {
    const [keyDown, setKeyDown] = useState(false)

    useHotkeys(key, (e) => {
        switch (e.type) {
            case "keydown": setKeyDown(true)
                break
            case "keyup": setKeyDown(false)
                break
        }
    }, {
        ...opts,
        keydown: true,
        keyup: true,
    })

    return keyDown
}


/**
 * Hook for causing re-renders as a result of a motion value changing.
 */
export function useMotionValueState<T extends any = any>(
    motionValue: MotionValue<T>,
    event: Parameters<typeof useMotionValueEvent>[1] = "change"
) {
    const [value, setValue] = useState(motionValue.get())
    useMotionValueEvent(motionValue, event, () => setValue(motionValue.get()))
    return value
}


/**
 * Hook for getting the previous value of an element using a ref.
 * Useful for ResizeObserver and other similar APIs to keep subscriptions
 * up to date.
 */
export function useElementChangeRef(callback: (prev: HTMLElement | null, current: HTMLElement) => void) {
    const prev = useRef<HTMLElement | null>(null)
    return (element: HTMLElement | null) => {
        if (!element) return
        callback(prev.current, element)
    }
}


/**
 * Hook for detecting changes in a value, but provides the previous
 * value to the callback.
 */
export function useStateChange<T>(value: T, callback: (prev: T | undefined, current: T) => void) {
    const prev = useRef<T | undefined>()
    useEffect(() => {
        callback(prev.current, value)
        prev.current = value
    }, [value])
}


/**
 * Hook for getting the mouse position as a motion value.
 */
export function useMouseMotionValue() {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            x.set(e.clientX)
            y.set(e.clientY)
        }
        window.addEventListener("pointermove", onPointerMove)
        return () => window.removeEventListener("pointermove", onPointerMove)
    }, [x, y])

    return { x, y }
}