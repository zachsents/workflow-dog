import { useEffect, useState } from "react"

export function useBooleanState(initialState = false) {
    const [state, setState] = useState(initialState)
    const setTrue = () => setState(true)
    const setFalse = () => setState(false)
    return [state, setTrue, setFalse, setState] as const
}


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


export function useLogEffect<T>(state: T, {
    dependencyTransform,
    prefix,
}: {
    dependencyTransform?: (state: T) => any
    prefix?: string
} = {}) {
    useEffect(() => {
        if (prefix)
            console.log(prefix, state)
        else
            console.log(state)
    }, [dependencyTransform ? dependencyTransform(state) : state])
}