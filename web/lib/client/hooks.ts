import "client-only"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"


export function useCurrentProjectId() {
    return useParams()?.projectId
}


export function useCurrentWorkflowId() {
    return useParams()?.workflowId as string | undefined
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