import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion"
import Fuse, { type IFuseOptions } from "fuse.js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHotkeys, type Options as HotKeysOptions } from "react-hotkeys-hook"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { trpc } from "./trpc"
import type { ApiRouterInput } from "api/trpc/router"
import { usePreviousDistinct } from "@react-hookz/web"

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


/**
 * Hook for getting the current project ID from the URL.
 */
export function useCurrentProjectId() {
    const { projectId } = useParams<{ projectId: string }>()
    if (!projectId)
        throw new Error("No projectId found in params.")
    return projectId
}


/**
 * Hook for getting the current project using the project ID
 * from the URL.
 */
export function useCurrentProject() {
    const navigate = useNavigate()

    const projectId = useCurrentProjectId()
    const query = trpc.projects.byId.useQuery({ projectId }, {
        retry: (failureCount, error) => {
            if (failureCount >= 2)
                return false
            if (["FORBIDDEN", "NOT_FOUND", "BAD_REQUEST"].includes(error.data?.code as any))
                return false
            return true
        },
        throwOnError: false,
    })

    useEffect(() => {
        if (!query.isError)
            return
        console.debug(query.error.data?.code)

        const storedProjectId = window.localStorage.getItem("currentProjectId")
        if (storedProjectId === projectId)
            window.localStorage.removeItem("currentProjectId")

        navigate("/projects")
    }, [query.isError])

    return query
}


/**
 * Hook for getting the current workflow ID from the URL.
 */
export function useCurrentWorkflowId() {
    const { workflowId } = useParams<{ workflowId: string }>()
    if (!workflowId)
        throw new Error("No workflowId found in params.")
    return workflowId
}


/**
 * Hook for getting the current workflow using the workflow ID
 * from the URL.
 */
export function useCurrentWorkflow(opts: Omit<ApiRouterInput["workflows"]["byId"], "workflowId"> = {}) {
    const workflowId = useCurrentWorkflowId()
    return trpc.workflows.byId.useQuery({ workflowId, ...opts })
}


/**
 * Hook for getting the current project ID from the workflow
 * referenced by the workflow ID in the URL.
 */
export function useCurrentProjectIdFromWorkflow() {
    const workflow = useCurrentWorkflow().data
    return workflow?.project_id ?? null
}


export function useControlledState<T>(
    passedValue?: T,
    onChange?: (value: T) => void,
    defaultValue?: T,
) {

    const isControlled = passedValue !== undefined
    const wasControlled = usePreviousDistinct(isControlled)

    useEffect(() => {
        if (isControlled && !wasControlled)
            console.warn("useControlledState: value is switching from uncontrolled to controlled")
        if (!isControlled && wasControlled)
            console.warn("useControlledState: value is switching from controlled to uncontrolled")
    }, [isControlled, wasControlled])

    const [internal, setInternal] = useState<T | undefined>(isControlled ? passedValue : defaultValue)
    const value = isControlled ? passedValue : internal
    const setValue = useCallback((value: T) => {
        setInternal(value)
        onChange?.(value)
    }, [])

    return [value, setValue] as const
}


export function usePreventUnloadWhileSaving(saving: boolean) {
    useEffect(() => {
        if (saving) {
            const ac = new AbortController()
            window.addEventListener("beforeunload", e => e.preventDefault(), { signal: ac.signal })
            return () => ac.abort()
        }
    }, [saving])
}


export function useSelectedRunId() {
    const SELECTED_RUN_QUERY_KEY = "r"
    
    const [params, setParams] = useSearchParams()
    const selectedRunId = params.get(SELECTED_RUN_QUERY_KEY) || null
    const setSelectedRun = useCallback((runId: string | null) => {
        if (runId)
            params.set(SELECTED_RUN_QUERY_KEY, runId)
        else
            params.delete(SELECTED_RUN_QUERY_KEY)
        setParams(params.toString())
    }, [params])

    return [selectedRunId, setSelectedRun] as const
}