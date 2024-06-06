import { RealtimePostgresChangesFilter } from "@supabase/supabase-js"
import { useWorkflow } from "@web/modules/workflows"
import "client-only"
import type { IFuseOptions } from "fuse.js"
import Fuse from "fuse.js"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSupabaseBrowser } from "./supabase"


export function useCurrentProjectId(mode: "url" | "workflow" = "url") {
    switch (mode) {
        case "url":
            const params = useParams()
            return Array.isArray(params?.projectId)
                ? params.projectId[0]
                : params?.projectId
        case "workflow":
            const { data: workflow } = useWorkflow()
            return workflow?.project_id
    }
}


export function useCurrentWorkflowId() {
    const params = useParams()
    return Array.isArray(params?.workflowId)
        ? params.workflowId[0]
        : params?.workflowId
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
 * @deprecated
 * Replaced in favor of server actions with global store, but may still be useful for local state.
 */
export function useLocalState<T>(initialState: T, setter: (...args: any[]) => Promise<T>) {
    const [localState, setLocalState] = useState(initialState)
    const [isLoading, startLoading, stopLoading] = useBooleanState()

    const setState = (...args: any[]) => {
        startLoading()
        setter(...args)
            .then(setLocalState)
            .finally(stopLoading)
    }

    return [localState, setState, isLoading] as const
}


/**
 * Simple alias for `useEffect` that logs the state on every change.
 */
export function useLogEffect<T>(state: T, options: string | {
    dependencyTransform?: (state: T) => any
    prefix?: string
} = {}) {
    const { prefix, dependencyTransform = null } = typeof options === "string"
        ? { prefix: options }
        : options

    useEffect(() => {
        if (prefix)
            console.log(prefix, state)
        else
            console.log(state)
    }, [dependencyTransform ? dependencyTransform(state) : state])
}


/**
 * Simple hook to get hover state. In most cases, we should use CSS hover
 * states, but this is useful for more complex interactions.
 * 
 * Uses a window listener with mousemove event because onMouseEnter and
 * onMouseLeave events are not reliable.
 */
export function useHover<T extends Element>() {
    const ref = useRef<T>(null)

    const [isHovered, setHovered] = useState(false)

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (!ref.current)
                return

            setHovered(ref.current.contains(event.target as Node))
        }

        window.addEventListener("mousemove", handler)
        return () => window.removeEventListener("mousemove", handler)
    }, [])

    return [ref, isHovered] as const
}


/**
 * Hook for getting the current location href. It's surprisingly
 * difficult to reliably re-render based on location changes. Did
 * some hacky stuff here.
 */
export function useLocationHref() {
    const [href, _setHref] = useState<string>()
    const setHref = () => _setHref(window.location.href)

    const pathname = usePathname()

    useEffect(() => {
        setTimeout(setHref, 0)
    }, [pathname])

    useEffect(() => {
        if (typeof window === "undefined")
            return
        window.addEventListener("hashchange", setHref)
        return () => void window.removeEventListener("hashchange", setHref)
    }, [])

    return href
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
            .map(r => list.find(item => item[idKey] === r.item[idKey]))
            .filter(Boolean) as T[]
    }, [query, list, fuseIndex])

    return {
        query,
        setQuery,
        clear: () => setQuery(""),
        filtered,
    }
}


interface UseSearchParamEffectOptions {
    clearAfterEffect?: boolean
}

/**
 * Hook that runs an effect based on the presence of a query parameter.
 */
export function useSearchParamEffect(key: string, cb: (value: string) => void, {
    clearAfterEffect = true,
}: UseSearchParamEffectOptions = {}) {
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams()
    const value = params.get(key)

    useEffect(() => {
        if (value != null) {
            cb(value)

            if (clearAfterEffect) {
                const newParams = new URLSearchParams(Object.fromEntries(params.entries()))
                newParams.delete(key)
                router.replace(`${pathname}?${newParams.toString()}`)
            }
        }
    }, [value])
}


/**
 * Hook for listening to database changes.
 */
export function useOnDatabaseChange<T extends "*" | "INSERT" | "UPDATE" | "DELETE">(
    postgresFilterOptions: RealtimePostgresChangesFilter<T>,
    callback: (newRow: Record<string, any>, oldRow: Record<string, any>) => void,
) {
    const supabase = useSupabaseBrowser()

    useEffect(() => {
        const channel = supabase
            .channel("realtime-db-query")
            // seems like there's a bug in the types
            .on("postgres_changes" as any, postgresFilterOptions, (payload) => {
                callback(payload.new, payload.old)
            })
            .subscribe()

        return () => void channel.unsubscribe()
    }, [
        JSON.stringify(postgresFilterOptions),
    ])
}