"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { type StoreApi, useStore } from "zustand"
import { createStore } from "zustand/vanilla"
import _, { type PropertyPath } from "lodash"
import { produce } from "immer"
import { useShallow } from "zustand/react/shallow"


export const QueryStoreContext = createContext<StoreApi<any> | null>(null)


export function QueryStoreProvider({ children }: { children: any }) {
    const storeRef = useRef<StoreApi<any>>()
    if (!storeRef.current) {
        storeRef.current = createStore(set => ({

        }))
    }

    return (
        <QueryStoreContext.Provider value={storeRef.current} >
            {children}
        </QueryStoreContext.Provider>
    )
}

export function useQueryStoreApi() {
    const storeContext = useContext(QueryStoreContext)

    if (!storeContext) {
        throw new Error(`useQueryStoreApi must be use within QueryStoreProvider`)
    }

    return storeContext
}


export function useQueryStore<T>(selector: (store: any) => T) {
    return useStore(useQueryStoreApi(), selector)
}

interface FromStoreProps {
    path: PropertyPath
    initial?: any
    pass?: boolean
    children?: (value: any) => any
}

export function FromStore({
    path,
    initial,
    pass,
    children = pass ? x => x : () => null
}: FromStoreProps) {
    const value = useFromStore(path, initial)
    const contentFactory = useCallback(children, [pass])
    return useMemo(() => contentFactory(value), [value])
}


export function useFromStore(path: PropertyPath, initial?: any) {
    const store = useQueryStoreApi()

    useEffect(() => {
        if (initial === undefined || !path || (Array.isArray(path) && path.some(p => !p)))
            return

        store.setState(produce((draft: any) => {
            _.set(draft, path, initial)
        }))
    }, [path.toString()])

    const storeValue = useQueryStore(state => _.get(state, path))
    return storeValue === undefined ? initial : storeValue
}

/**
 * WIP
 */
export function useFromStoreList(items: { path: PropertyPath, initial?: any }[]) {
    const store = useQueryStoreApi()

    useEffect(() => {
        store.setState(produce((draft: any) => {
            items.forEach(({ path, initial }) => {
                if (initial === undefined || !path || (Array.isArray(path) && path.some(p => !p)))
                    return

                _.set(draft, path, initial)
            })
        }))
    }, [items.map(({ path }) => path.toString()).join(",")])

    return useQueryStore(useShallow(state => items.map(({ path, initial }) => {
        const storeValue = _.get(state, path)
        return storeValue === undefined ? initial : storeValue
    })))
}